import {GraphQlRequest} from '../../GraphQlRequest';
import User = api.security.User;
import PrincipalKey = api.security.PrincipalKey;

export class UpdateUserRequest
    extends GraphQlRequest<any, User> {

    private key: PrincipalKey;
    private displayName: string;
    private email: string;
    private login: string;
    private membershipsToAdd: PrincipalKey[] = [];
    private membershipsToRemove: PrincipalKey[] = [];

    private static readonly mutation = `mutation ($key: String!, $displayName: String!, $email: String!, $login: String!, $addMemberships: [String], $removeMemberships: [String]) {
            updateUser(key: $key, displayName: $displayName, email: $email, login: $login, addMemberships: $addMemberships, removeMemberships: $removeMemberships) {
                key
                login
                displayName
                email
                memberships {
                    key
                    displayName
                }
            }
        }`;


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

    sendAndParse(): wemQ.Promise<User> {
        return this.mutate(UpdateUserRequest.mutation).then(json => User.fromJson(json.updateUser));
    }

}
