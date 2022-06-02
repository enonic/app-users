import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';

export interface UserJson
    extends PrincipalJson {

    name: string;

    email: string;

    login: string;

    loginDisabled: boolean;

    memberships?: PrincipalJson[];

}
