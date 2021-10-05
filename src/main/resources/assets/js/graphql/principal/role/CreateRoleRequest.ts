import {GraphQlRequest} from '../../GraphQlRequest';
import {Role} from '../../../app/principal/Role';
import {RoleJson} from '../../../app/principal/RoleJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';

// Key and members should be PrincipalsKeys?
interface CreateRoleProperties {
    key: string; 
    displayName: string;
    description: string;
    members: string[];
}

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
        let vars = <CreateRoleProperties>super.getVariables();
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
        return this.mutate().then(json => this.fromJson(json.createRole, json.error));
    }

    fromJson(role: RoleJson, error: string): Role {
        if (!role || error) {
            throw error;
        }
        return Role.fromJson(role);
    }
}
