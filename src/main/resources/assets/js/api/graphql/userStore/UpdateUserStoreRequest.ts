import {GraphQlRequest} from '../GraphQlRequest';
import UserStore = api.security.UserStore;
import UserStoreKey = api.security.UserStoreKey;
import AuthConfig = api.security.AuthConfig;
import UserStoreJson = api.security.UserStoreJson;

export class UpdateUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    private userStoreKey: UserStoreKey;
    private displayName: string;
    private description: string;
    private authConfig: AuthConfig;
    private permissions: api.security.acl.UserStoreAccessControlList;

    getVariables(): Object {
        let authConfig = this.authConfig ? {
            applicationKey: this.authConfig.getApplicationKey().toString(),
            config: this.authConfig.getConfig() ? JSON.stringify(this.authConfig.getConfig().toJson()) : undefined
        } : undefined;

        let vars = super.getVariables();
        vars['key'] = this.userStoreKey.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['authConfig'] = authConfig;
        vars['permissions'] = this.permissions ? this.permissions.toJson() : undefined;
        return vars;
    }

    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String, $authConfig: AuthConfigInput, $permissions: [UserStoreAccessControlInput]) {
            updateUserStore(key: $key, displayName: $displayName, description: $description, authConfig: $authConfig, permissions: $permissions) {
                key
                displayName
                description
                authConfig {
                    applicationKey
                    config
                }
                idProviderMode,
                modifiedTime,
                permissions {
                    principal {
                        displayName
                        key
                    }
                    access
                }
            }
        }`;
    }

    setKey(userStoreKey: UserStoreKey): UpdateUserStoreRequest {
        this.userStoreKey = userStoreKey;
        return this;
    }

    setDisplayName(displayName: string): UpdateUserStoreRequest {
        this.displayName = displayName;
        return this;
    }

    setDescription(description: string): UpdateUserStoreRequest {
        this.description = description;
        return this;
    }

    setAuthConfig(authConfig: AuthConfig): UpdateUserStoreRequest {
        this.authConfig = authConfig;
        return this;
    }

    setPermissions(permissions: api.security.acl.UserStoreAccessControlList): UpdateUserStoreRequest {
        this.permissions = permissions;
        return this;
    }

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.mutate().then(json => this.userStorefromJson(json.updateUserStore));
    }

    userStorefromJson(us: UserStoreJson) {
        if (!us) {
            throw `UserStore[${this.userStoreKey.toString()}] not found`;
        }
        if (us.authConfig && typeof us.authConfig.config === 'string') {
            // config is passed as string
            us.authConfig.config = JSON.parse(<string>us.authConfig.config);
        }
        return UserStore.fromJson(us);
    }

}
