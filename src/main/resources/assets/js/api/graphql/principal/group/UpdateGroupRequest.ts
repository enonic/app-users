import {GraphQlRequest} from '../../GraphQlRequest';
import {Group} from '../../../../app/principal/Group';
import PrincipalKey = api.security.PrincipalKey;

export class UpdateGroupRequest
    extends GraphQlRequest<any, Group> {

    private key: PrincipalKey;
    private displayName: string;
    private membersToAdd: PrincipalKey[] = [];
    private membersToRemove: PrincipalKey[] = [];
    private membershipsToAdd: PrincipalKey[] = [];
    private membershipsToRemove: PrincipalKey[] = [];
    private description: string;

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

    addMemberships(memberships: PrincipalKey[]): UpdateGroupRequest {
        this.membershipsToAdd = memberships.slice(0);
        return this;
    }

    removeMemberhips(memberships: PrincipalKey[]): UpdateGroupRequest {
        this.membershipsToRemove = memberships.slice(0);
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
        vars['addMembers'] = this.membersToAdd.map(key => key.toString());
        vars['removeMembers'] = this.membersToRemove.map(key => key.toString());
        vars['addMemberships'] = this.membershipsToAdd.map(key => key.toString());
        vars['removeMemberships'] = this.membershipsToRemove.map(key => key.toString());
        vars['description'] = this.description;

        return vars;
    }

    // tslint:disable max-line-length
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String!, $addMembers: [String], $removeMembers: [String], $addMemberships: [String], $removeMemberships: [String]) {
            updateGroup(key: $key, displayName: $displayName, description: $description, addMembers: $addMembers, removeMembers: $removeMembers, addMemberships: $addMemberships, removeMemberships: $removeMemberships) {
                key
                displayName
                description
                members
                memberships {
                    key
                    displayName
                    description
                }
            }
        }`;
    }
    // tslint:enable max-line-length

    sendAndParse(): wemQ.Promise<Group> {
        return this.mutate().then(json => Group.fromJson(json.updateGroup));
    }

}
