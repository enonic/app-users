import {GraphQlRequest} from '../GraphQlRequest';
import {UserStore} from '../../../app/principal/UserStore';
import {UserStoreAccessControlList} from '../../../app/access/UserStoreAccessControlList';
import {UserStoreAccess} from '../../../app/access/UserStoreAccess';
import {UserStoreJson} from '../../../app/principal/UserStoreJson';
import IdProviderConfig = api.security.IdProviderConfig;
import UserStoreKey = api.security.UserStoreKey;

export type SaveMutation = 'updateUserStore' | 'createUserStore';

export class SaveUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    private userStoreKey: UserStoreKey;
    private displayName: string;
    private description: string;
    private idProviderConfig: IdProviderConfig;
    private permissions: UserStoreAccessControlList;

    private mutationType: SaveMutation;

    constructor(mutationType: SaveMutation) {
        super();
        this.mutationType = mutationType;
    }

    getVariables(): Object {
        const idProviderConfig = this.idProviderConfig ? {
            applicationKey: this.idProviderConfig.getApplicationKey().toString(),
            config: this.idProviderConfig.getConfig() ? JSON.stringify(this.idProviderConfig.getConfig().toJson()) : null
        } : null;

        const createAccess = p => ({principal: p.getPrincipal().getKey().toString(), access: UserStoreAccess[p.getAccess()]});
        const permissions = this.permissions ? this.permissions.getEntries().map(createAccess) : null;

        const vars = super.getVariables();
        vars['key'] = this.userStoreKey.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['idProviderConfig'] = idProviderConfig;
        vars['permissions'] = permissions;

        return vars;
    }

    // tslint:disable max-line-length
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String, $idProviderConfig: IdProviderConfigInput, $permissions: [UserStoreAccessControlInput]) {
            ${this.mutationType}(key: $key, displayName: $displayName, description: $description, idProviderConfig: $idProviderConfig, permissions: $permissions) {
                key
                displayName
                description
                idProviderConfig {
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

    setIdProviderConfig(idProviderConfig: IdProviderConfig): SaveUserStoreRequest {
        this.idProviderConfig = idProviderConfig;
        return this;
    }

    setPermissions(permissions: UserStoreAccessControlList): SaveUserStoreRequest {
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

        if (us.idProviderConfig && typeof us.idProviderConfig.config === 'string') {
            us.idProviderConfig.config = JSON.parse(<string>us.idProviderConfig.config);
        }
        return UserStore.fromJson(us);
    }

}
