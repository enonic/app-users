import AuthConfigJson = api.security.AuthConfigJson;
import UserItemJson = api.security.UserItemJson;
import {UserStoreAccessControlEntryJson} from '../access/UserStoreAccessControlEntryJson';

export interface UserStoreJson
    extends UserItemJson {

    authConfig?: AuthConfigJson;
    idProviderMode: string;
    permissions?: UserStoreAccessControlEntryJson[];
}
