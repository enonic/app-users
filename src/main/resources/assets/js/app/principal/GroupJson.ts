import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';
import {MembershipJson} from './MembershipJson';

export interface GroupJson
    extends MembershipJson {

    memberships?: PrincipalJson[];

}
