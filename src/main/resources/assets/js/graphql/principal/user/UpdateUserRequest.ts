import {GraphQlRequest, GraphQlMutationResponse} from '../../GraphQlRequest';
import {User} from '../../../app/principal/User';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserJson} from '../../../app/principal/UserJson';

type UpdateUserMutationResponse = GraphQlMutationResponse & {
    updateUser: UserJson;
};

export class UpdateUserRequest
    extends GraphQlRequest<User> {

    private key: PrincipalKey;
    private displayName: string;
    private email: string;
    private login: string;
    private membershipsToAdd: PrincipalKey[] = [];
    private membershipsToRemove: PrincipalKey[] = [];
    private password: string;

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

    setPassword(password: string): UpdateUserRequest {
        this.password = password;
        return this;
    }

    getVariables(): object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['email'] = this.email;
        vars['login'] = this.login;
        vars['addMemberships'] = this.membershipsToAdd.map((memberKey) => memberKey.toString());
        vars['removeMemberships'] = this.membershipsToRemove.map((memberKey) => memberKey.toString());
        vars['password'] = this.password;
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $email: String!, $login: String!, $addMemberships: [String],
                          $removeMemberships: [String], $password: String) {
            updateUser(key: $key, displayName: $displayName, email: $email, login: $login, addMemberships: $addMemberships,
                       removeMemberships: $removeMemberships, password: $password) {
                key
                login
                displayName
                email
                hasPassword
                memberships {
                    key
                    displayName
                    description
                }
                publicKeys {
                    kid
                    publicKey
                    creationTime
                    label
                }
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<User> {
        return this.mutate().then((json: UpdateUserMutationResponse) => this.fromJson(json.updateUser, json.error));
    }

    fromJson(user: UserJson, error: string): User {
        if (!user || error) {
            throw Error(error);
        }
        return User.fromJson(user);
    }
}
