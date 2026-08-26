package com.enonic.xp.app.users.lib.idprovider;

import java.util.List;

import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

import static com.enonic.xp.security.acl.IdProviderAccess.ADMINISTRATOR;
import static com.enonic.xp.security.acl.IdProviderAccess.READ;

public final class DefaultIdProviderPermissionsHandler
    extends AbstractIdProviderPermissionsHandler
{
    // ! What a provider starts with, and the same three entries app-users seeds a new one from. XP
    // ! itself declares no default, so the list lives here rather than in the platform.
    private static final IdProviderAccessControlList DEFAULT = IdProviderAccessControlList.of(
        IdProviderAccessControlEntry.create().principal( RoleKeys.ADMIN ).access( ADMINISTRATOR ).build(),
        IdProviderAccessControlEntry.create().principal( RoleKeys.USER_MANAGER_ADMIN ).access( ADMINISTRATOR ).build(),
        IdProviderAccessControlEntry.create().principal( RoleKeys.AUTHENTICATED ).access( READ ).build() );

    public List<IdProviderPermissionMapper> execute()
    {
        return map( DEFAULT );
    }
}
