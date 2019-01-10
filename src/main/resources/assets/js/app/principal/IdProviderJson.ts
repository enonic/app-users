import IdProviderConfigJson = api.security.IdProviderConfigJson;
import UserItemJson = api.security.UserItemJson;
import {IdProviderAccessControlEntryJson} from '../access/IdProviderAccessControlEntryJson';

export interface IdProviderJson
    extends UserItemJson {

    idProviderConfig?: IdProviderConfigJson;
    idProviderMode: string;
    permissions?: IdProviderAccessControlEntryJson[];
}
