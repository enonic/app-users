import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {PublicKeyJson} from './PublicKeyJson';

export interface UserJson
    extends PrincipalJson {

    name: string;

    email: string;

    login: string;

    loginDisabled: boolean;

    memberships?: PrincipalJson[];

    publicKeys?: PublicKeyJson[];

    hasPassword: boolean;

}
