import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {MembersJson} from './MembersJson';

export interface GroupJson
    extends MembersJson {

    memberships?: PrincipalJson[];

}
