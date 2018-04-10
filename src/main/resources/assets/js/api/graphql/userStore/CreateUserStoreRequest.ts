import {GraphQlRequest} from '../GraphQlRequest';
import UserStoreJson = api.security.UserStoreJson;
import UserStore = api.security.UserStore;
import UserStoreKey = api.security.UserStoreKey;
import AuthConfig = api.security.AuthConfig;
import UserStoreAccess = api.security.acl.UserStoreAccess;

export class CreateUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    private userStoreKey: UserStoreKey;
    private displayName: string;
    private description: string;
    private authConfig: AuthConfig;
    private permissions: api.security.acl.UserStoreAccessControlList;

    getVariables(): { [p: string]: any } {
        let vars = super.getVariables();

        // stringify config because there's no graphql type for it
        const authConfig = this.authConfig ? {
            applicationKey: this.authConfig.getApplicationKey().toString(),
            config: this.authConfig.getConfig() ? JSON.stringify(this.authConfig.getConfig().toJson()) : null
        } : null;

        const createAccess = p => ({ principal: p.getPrincipal().getKey().toString(), access: UserStoreAccess[p.getAccess()] });
        const permissions = this.permissions ? this.permissions.getEntries().map(createAccess) : [];

        vars['key'] = this.userStoreKey.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['authConfig'] = authConfig;
        vars['permissions'] = permissions;
        return vars;
    }

    // tslint:disable max-line-length
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String, $authConfig: AuthConfigInput, $permissions: [UserStoreAccessControlInput]) {
            createUserStore(key: $key, displayName: $displayName, description: $description, authConfig: $authConfig, permissions: $permissions) {
                key
                displayName
                description
                idProviderMode
                authConfig {
                    applicationKey
                    config
                }
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
    // tslint:enable max-line-length

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
        return this.mutate().then(json => this.fromJson(json.createUserStore, json.error));
    }

    fromJson(userStore: UserStoreJson, error: string): UserStore {
        if (!userStore || error) {
            throw error;
        }
        if (userStore.authConfig && typeof userStore.authConfig.config === 'string') {
            // config is passed as string
            userStore.authConfig.config = JSON.parse(<string>userStore.authConfig.config);
        }
        return UserStore.fromJson(userStore);
    }
}
