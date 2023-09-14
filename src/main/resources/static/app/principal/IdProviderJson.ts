import {IdProviderConfigJson} from '@enonic/lib-admin-ui/security/IdProviderConfigJson';
import {UserItemJson} from '@enonic/lib-admin-ui/security/UserItemJson';
import {IdProviderAccessControlEntryJson} from '../access/IdProviderAccessControlEntryJson';

export interface IdProviderJson
    extends UserItemJson {

    idProviderConfig?: IdProviderConfigJson;
    idProviderMode: string;
    permissions?: IdProviderAccessControlEntryJson[];
}
