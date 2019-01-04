import IdProviderConfigJson = api.security.IdProviderConfigJson;
import UserItemJson = api.security.UserItemJson;
import {UserStoreAccessControlEntryJson} from '../access/UserStoreAccessControlEntryJson';

export interface UserStoreJson
    extends UserItemJson {

    idProviderConfig?: IdProviderConfigJson;
    idProviderMode: string;
    permissions?: UserStoreAccessControlEntryJson[];
}
