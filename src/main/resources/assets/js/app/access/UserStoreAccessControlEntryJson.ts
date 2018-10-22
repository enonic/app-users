import PrincipalJson = api.security.PrincipalJson;

export interface UserStoreAccessControlEntryJson {

    access: string;

    principal: PrincipalJson;

}
