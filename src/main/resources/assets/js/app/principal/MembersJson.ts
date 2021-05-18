import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';

export interface MembersJson
    extends PrincipalJson {

    members?: string[];

}
