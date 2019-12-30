import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';

export interface GroupJson
    extends PrincipalJson {

    members?: string[];

    memberships?: PrincipalJson[];

}
