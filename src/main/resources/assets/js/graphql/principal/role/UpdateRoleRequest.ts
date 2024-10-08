import {GraphQlRequest, GraphQlMutationResponse} from '../../GraphQlRequest';
import {Role} from '../../../app/principal/Role';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {MembersJson} from '../../../app/principal/MembersJson';

type UpdateRoleMutationResponse = GraphQlMutationResponse & {
    updateRole: MembersJson;
};

export class UpdateRoleRequest
    extends GraphQlRequest<Role> {

    private key: PrincipalKey;
    private displayName: string;
    private membersToAdd: PrincipalKey[] = [];
    private membersToRemove: PrincipalKey[] = [];
    private description: string;

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

    getVariables(): object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['addMembers'] = this.membersToAdd.map((memberKey) => memberKey.toString());
        vars['removeMembers'] = this.membersToRemove.map((memberKey) => memberKey.toString());
        vars['description'] = this.description;
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String!, $addMembers: [String], $removeMembers: [String]) {
            updateRole(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers) {
                key
                displayName
                description
                members
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Role> {
        return this.mutate().then((json: UpdateRoleMutationResponse) => this.fromJson(json.updateRole, json.error));
    }

    fromJson(role: MembersJson, error: string): Role {
        if (!role || error) {
            throw Error(error);
        }

        return Role.fromJson(role);
    }
}
