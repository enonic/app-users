import {GraphQlRequest} from '../../GraphQlRequest';
import {Group} from '../../../app/principal/Group';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {GroupJson} from '../../../app/principal/GroupJson';

export class UpdateGroupRequest
    extends GraphQlRequest<Group> {

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

    /* eslint-disable max-len */
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

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Group> {
        return this.mutate().then(json => this.fromJson(json.updateGroup, json.error));
    }

    fromJson(group: GroupJson, error: string): Group {
        if (!group || error) {
            throw error;
        }

        return Group.fromJson(group);
    }

}
