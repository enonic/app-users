import PrincipalJson = api.security.PrincipalJson;

export interface GroupJson
    extends PrincipalJson {

    members?: string[];

    memberships?: PrincipalJson[];

}
