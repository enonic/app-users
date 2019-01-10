import {GraphQlRequest} from '../GraphQlRequest';
import {IdProvider} from '../../../app/principal/IdProvider';
import {IdProviderAccessControlList} from '../../../app/access/IdProviderAccessControlList';
import {IdProviderAccess} from '../../../app/access/IdProviderAccess';
import {IdProviderJson} from '../../../app/principal/IdProviderJson';
import IdProviderConfig = api.security.IdProviderConfig;
import IdProviderKey = api.security.IdProviderKey;

export type SaveMutation = 'updateIdProvider' | 'createIdProvider';

export class SaveIdProviderRequest
    extends GraphQlRequest<any, IdProvider> {

    private idProviderKey: IdProviderKey;
    private displayName: string;
    private description: string;
    private idProviderConfig: IdProviderConfig;
    private permissions: IdProviderAccessControlList;

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

        const createAccess = p => ({principal: p.getPrincipal().getKey().toString(), access: IdProviderAccess[p.getAccess()]});
        const permissions = this.permissions ? this.permissions.getEntries().map(createAccess) : null;

        const vars = super.getVariables();
        vars['key'] = this.idProviderKey.toString();
        vars['displayName'] = this.displayName;
        vars['description'] = this.description;
        vars['idProviderConfig'] = idProviderConfig;
        vars['permissions'] = permissions;

        return vars;
    }

    // tslint:disable max-line-length
    getMutation(): string {
        return `mutation ($key: String!, $displayName: String!, $description: String, $idProviderConfig: IdProviderConfigInput, $permissions: [IdProviderAccessControlInput]) {
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

    setKey(idProviderKey: IdProviderKey): SaveIdProviderRequest {
        this.idProviderKey = idProviderKey;
        return this;
    }

    setDisplayName(displayName: string): SaveIdProviderRequest {
        this.displayName = displayName;
        return this;
    }

    setDescription(description: string): SaveIdProviderRequest {
        this.description = description;
        return this;
    }

    setIdProviderConfig(idProviderConfig: IdProviderConfig): SaveIdProviderRequest {
        this.idProviderConfig = idProviderConfig;
        return this;
    }

    setPermissions(permissions: IdProviderAccessControlList): SaveIdProviderRequest {
        this.permissions = permissions;
        return this;
    }

    sendAndParse(): wemQ.Promise<IdProvider> {
        return this.mutate().then(json => this.idProviderfromJson(json[this.mutationType], json.error));
    }

    idProviderfromJson(us: IdProviderJson, error: string) {
        if (error) {
            throw new api.Exception(error);
        } else if (!us) {
            throw new Error(`IdProvider [${this.idProviderKey.toString()}] not found`);
        }

        if (us.idProviderConfig && typeof us.idProviderConfig.config === 'string') {
            us.idProviderConfig.config = JSON.parse(<string>us.idProviderConfig.config);
        }
        return IdProvider.fromJson(us);
    }

}
