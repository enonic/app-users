package com.enonic.xp.app.users.lib.auth;

import java.util.List;

import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

import static com.enonic.xp.security.acl.IdProviderAccess.ADMINISTRATOR;
import static com.enonic.xp.security.acl.IdProviderAccess.READ;

public final class DefaultPermissionsHandler
    extends AbstractPermissionsHandler
{
    private static final IdProviderAccessControlList DEFAULT_ID_PROVIDER_ACL =
        IdProviderAccessControlList.of( IdProviderAccessControlEntry.create().principal( RoleKeys.ADMIN ).access( ADMINISTRATOR ).build(),
                                        IdProviderAccessControlEntry.create().principal( RoleKeys.USER_MANAGER_ADMIN ).access(
                                            ADMINISTRATOR ).build(),
                                        IdProviderAccessControlEntry.create().principal( RoleKeys.AUTHENTICATED ).access( READ ).build() );

    public List<IdProviderAccessControlEntryMapper> defaultPermissions()
    {
        return mapIdProviderPermissions( DEFAULT_ID_PROVIDER_ACL );
    }
}
