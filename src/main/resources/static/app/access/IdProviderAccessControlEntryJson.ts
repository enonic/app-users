import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';

export interface IdProviderAccessControlEntryJson {

    access: string;

    principal: PrincipalJson;

}
