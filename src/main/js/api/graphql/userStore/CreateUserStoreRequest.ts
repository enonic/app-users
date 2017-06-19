import {GraphQlRequest} from '../GraphQlRequest';
import UserStoreJson = api.security.UserStoreJson;
import UserStore = api.security.UserStore;
import UserStoreKey = api.security.UserStoreKey;
import AuthConfig = api.security.AuthConfig;

export class CreateUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    private userStoreKey: UserStoreKey;
    private displayName: string;
    private description: string;
    private authConfig: AuthConfig;
    private permissions: api.security.acl.UserStoreAccessControlList;

    private static readonly mutation = `mutation ($key: String!, $displayName: String!, $description: String, $authConfig: AuthConfigInput, $permissions: [UserStoreAccessControlInput]) {
            createUserStore(key: $key, displayName: $displayName, description: $description, authConfig: $authConfig, permissions: $permissions) {
                key
                path
                displayName
            }
        }`;

    getVariables(): { [p: string]: any } {
        let vars = super.getVariables();

        let authConfig;
        if (this.authConfig) {
            // stringify config because there's no graphql type for it
            authConfig = {
                applicationKey: this.authConfig.getApplicationKey().toString(),
                config: this.authConfig.getConfig() ? JSON.stringify(this.authConfig.getConfig().toJson()) : undefined
            }
        }

        vars['key'] = this.userStoreKey.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['authConfig'] = authConfig;
        vars['permissions'] = this.permissions ? this.permissions.toJson() : [];
        return vars;
    }

    setKey(userStoreKey: UserStoreKey): CreateUserStoreRequest {
        this.userStoreKey = userStoreKey;
        return this;
    }

    setDisplayName(displayName: string): CreateUserStoreRequest {
        this.displayName = displayName;
        return this;
    }

    setDescription(description: string): CreateUserStoreRequest {
        this.description = description;
        return this;
    }

    setAuthConfig(authConfig: AuthConfig): CreateUserStoreRequest {
        this.authConfig = authConfig;
        return this;
    }

    setPermissions(permissions: api.security.acl.UserStoreAccessControlList): CreateUserStoreRequest {
        this.permissions = permissions;
        return this;
    }

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.mutate(CreateUserStoreRequest.mutation).then(json => UserStore.fromJson(json.createUserStore));
    }
}
