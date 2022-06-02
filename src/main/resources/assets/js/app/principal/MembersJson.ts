import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';

export interface MembersJson
    extends PrincipalJson {

    members?: string[];

}
