import {GraphQlRequest} from '../../GraphQlRequest';
import Group = api.security.Group;
import PrincipalKey = api.security.PrincipalKey;

export class UpdateGroupRequest
    extends GraphQlRequest<any, Group> {

    private key: PrincipalKey;
    private displayName: string;
    private membersToAdd: PrincipalKey[] = [];
    private membersToRemove: PrincipalKey[] = [];
    private description: string;

    private static readonly mutation = `mutation ($key: String!, $displayName: String!, $description: String!, $addMembers: [String], $removeMembers: [String]) {
            updateGroup(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers) {
                key
                displayName
                description
                members
            }
        }`;

    setKey(key: PrincipalKey): UpdateGroupRequest {
        this.key = key;
        return this;
    }

    setDisplayName(displayName: string): UpdateGroupRequest {
        this.displayName = displayName;
        return this;
    }

    addMembers(members: PrincipalKey[]): UpdateGroupRequest {
        this.membersToAdd = members.slice(0);
        return this;
    }

    removeMembers(members: PrincipalKey[]): UpdateGroupRequest {
        this.membersToRemove = members.slice(0);
        return this;
    }

    setDescription(description: string): UpdateGroupRequest {
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

    sendAndParse(): wemQ.Promise<Group> {

        return this.mutate(UpdateGroupRequest.mutation).then(json => Group.fromJson(json.updateGroup));
    }

}

