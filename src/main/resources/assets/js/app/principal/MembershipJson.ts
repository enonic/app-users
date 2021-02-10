import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';

export interface MembershipJson
    extends PrincipalJson {

    members?: string[];

}
