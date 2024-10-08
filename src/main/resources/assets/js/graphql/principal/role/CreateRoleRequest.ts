import {GraphQlRequest, GraphQlMutationResponse} from '../../GraphQlRequest';
import {Role} from '../../../app/principal/Role';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {MembersJson} from '../../../app/principal/MembersJson';

// Key and members should be PrincipalsKeys?
interface CreateRoleProperties {
    key: string;
    displayName: string;
    description: string;
    members: string[];
}

type CreateRoleMutationResponse = GraphQlMutationResponse & {
    createRole: MembersJson;
};

export class CreateRoleRequest
    extends GraphQlRequest<Role> {

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

    getVariables(): CreateRoleProperties {
        let vars = super.getVariables() as CreateRoleProperties;
        vars.key = this.key.toString();
        vars.displayName = this.displayName;
        vars.description = this.description;
        vars.members = this.members.map(key => key.toString());
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

    sendAndParse(): Q.Promise<Role> {
        return this.mutate().then((json: CreateRoleMutationResponse) => this.fromJson(json.createRole, json.error));
    }

    fromJson(role: MembersJson, error: string): Role {
        if (!role || error) {
            throw Error(error);
        }
        return Role.fromJson(role);
    }
}
