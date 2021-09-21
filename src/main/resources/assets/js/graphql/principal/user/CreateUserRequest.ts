import {GraphQlRequest} from '../../GraphQlRequest';
import {User} from '../../../app/principal/User';
import {UserJson} from '../../../app/principal/UserJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';

type CreateUserRequestData = {
    key: PrincipalKey;
    displayName: string;
    email: string;
    login: string;
    password: string;
    memberships: PrincipalKey[];
};

export class CreateUserRequest
    extends GraphQlRequest<User> {

    private key: PrincipalKey;
    private displayName: string;
    private email: string;
    private login: string;
    private password: string;
    private memberships: PrincipalKey[] = [];

    setKey(key: PrincipalKey): CreateUserRequest {
        this.key = key;
        return this;
    }

    setDisplayName(displayName: string): CreateUserRequest {
        this.displayName = displayName;
        return this;
    }

    setEmail(email: string): CreateUserRequest {
        this.email = email;
        return this;
    }

    setLogin(login: string): CreateUserRequest {
        this.login = login;
        return this;
    }

    setPassword(password: string): CreateUserRequest {
        this.password = password;
        return this;
    }

    setMemberships(memberships: PrincipalKey[]): CreateUserRequest {
        this.memberships = memberships.slice(0);
        return this;
    }

    getVariables(): { [key: string]: CreateUserRequestData } {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        vars['email'] = this.email;
        vars['login'] = this.login;
        vars['password'] = this.password;
        vars['memberships'] = this.memberships.map(key => key.toString());
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $email: String!, $login: String!, $password: String!, $memberships: [String]) {
            createUser(key: $key, displayName: $displayName, email: $email, login: $login, password: $password, memberships: $memberships) {
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

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<User> {
        return this.mutate().then(json => this.fromJson(json.createUser, json.error));
    }

    fromJson(user: UserJson, error: string): User {
        if (!user || error) {
            throw error;
        }
        return User.fromJson(user);
    }
}
