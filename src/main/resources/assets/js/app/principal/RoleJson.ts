import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';

export interface RoleJson
    extends PrincipalJson {

    members?: string[];

}
