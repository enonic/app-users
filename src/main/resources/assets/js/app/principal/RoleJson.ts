import PrincipalJson = api.security.PrincipalJson;

export interface RoleJson
    extends PrincipalJson {

    members?: string[];

}
