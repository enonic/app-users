import {GraphQlRequest} from '../../GraphQlRequest';
import {User} from '../../../../app/principal/User';
import PrincipalKey = api.security.PrincipalKey;

export class UpdateUserRequest
    extends GraphQlRequest<any, User> {

    private key: PrincipalKey;
    private displayName: string;
    private email: string;
    private login: string;
    private membershipsToAdd: PrincipalKey[] = [];
    private membershipsToRemove: PrincipalKey[] = [];

    setKey(key: PrincipalKey): UpdateUserRequest {
        this.key = key;
        return this;
    }

    setDisplayName(displayName: string): UpdateUserRequest {
        this.displayName = displayName;
        return this;
    }

    setEmail(email: string): UpdateUserRequest {
        this.email = email;
        return this;
    }

    setLogin(login: string): UpdateUserRequest {
        this.login = login;
        return this;
    }

    addMemberships(memberships: PrincipalKey[]): UpdateUserRequest {
        this.membershipsToAdd = memberships.slice(0);
        return this;
    }

    removeMemberships(memberships: PrincipalKey[]): UpdateUserRequest {
        this.membershipsToRemove = memberships.slice(0);
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['email'] = this.email;
        vars['login'] = this.login;
        vars['addMemberships'] = this.membershipsToAdd.map((memberKey) => memberKey.toString());
        vars['removeMemberships'] = this.membershipsToRemove.map((memberKey) => memberKey.toString());
        return vars;
    }

    // tslint:disable max-line-length
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $email: String!, $login: String!, $addMemberships: [String], $removeMemberships: [String]) {
            updateUser(key: $key, displayName: $displayName, email: $email, login: $login, addMemberships: $addMemberships, removeMemberships: $removeMemberships) {
                key
                login
                displayName
                email
                memberships {
                    key
                    displayName
                    description
                }
            }
        }`;
    }
    // tslint:enable max-line-length

    sendAndParse(): wemQ.Promise<User> {
        return this.mutate().then(json => User.fromJson(json.updateUser));
    }

}
