import {GraphQlRequest} from '../GraphQlRequest';
import UserStore = api.security.UserStore;
import UserStoreKey = api.security.UserStoreKey;
import AuthConfig = api.security.AuthConfig;
import UserStoreJson = api.security.UserStoreJson;
import UserStoreAccess = api.security.acl.UserStoreAccess;

export type SaveMutation = 'updateUserStore' | 'createUserStore';

export class SaveUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    private userStoreKey: UserStoreKey;
    private displayName: string;
    private description: string;
    private authConfig: AuthConfig;
    private permissions: api.security.acl.UserStoreAccessControlList;

    private mutationType: SaveMutation;

    constructor(mutationType: SaveMutation) {
        super();
        this.mutationType = mutationType;
    }

    getVariables(): Object {
        const authConfig = this.authConfig ? {
            applicationKey: this.authConfig.getApplicationKey().toString(),
            config: this.authConfig.getConfig() ? JSON.stringify(this.authConfig.getConfig().toJson()) : null
        } : null;

        const createAccess = p => ({principal: p.getPrincipal().getKey().toString(), access: UserStoreAccess[p.getAccess()]});
        const permissions = this.permissions ? this.permissions.getEntries().map(createAccess) : null;

        const vars = super.getVariables();
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
            ${this.mutationType}(key: $key, displayName: $displayName, description: $description, authConfig: $authConfig, permissions: $permissions) {
                key
                displayName
                description
                authConfig {
                    applicationKey
                    config
                }
                idProviderMode,
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

    setKey(userStoreKey: UserStoreKey): SaveUserStoreRequest {
        this.userStoreKey = userStoreKey;
        return this;
    }

    setDisplayName(displayName: string): SaveUserStoreRequest {
        this.displayName = displayName;
        return this;
    }

    setDescription(description: string): SaveUserStoreRequest {
        this.description = description;
        return this;
    }

    setAuthConfig(authConfig: AuthConfig): SaveUserStoreRequest {
        this.authConfig = authConfig;
        return this;
    }

    setPermissions(permissions: api.security.acl.UserStoreAccessControlList): SaveUserStoreRequest {
        this.permissions = permissions;
        return this;
    }

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.mutate().then(json => this.userStorefromJson(json[this.mutationType], json.error));
    }

    userStorefromJson(us: UserStoreJson, error: string) {
        if (error) {
            throw new api.Exception(error);
        } else if (!us) {
            throw new Error(`UserStore [${this.userStoreKey.toString()}] not found`);
        }

        if (us.authConfig && typeof us.authConfig.config === 'string') {
            us.authConfig.config = JSON.parse(<string>us.authConfig.config);
        }
        return UserStore.fromJson(us);
    }

}
