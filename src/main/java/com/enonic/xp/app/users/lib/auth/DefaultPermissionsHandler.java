package com.enonic.xp.app.users.lib.auth;

import java.util.List;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public final class DefaultPermissionsHandler
    extends AbstractPermissionsHandler
{
    public List<UserStoreAccessControlEntryMapper> defaultPermissions()
    {
        final UserStoreAccessControlList userStorePermissions = securityService.get().getDefaultUserStorePermissions();
        return mapUserStorePermissions( userStorePermissions );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        securityService = context.getService( SecurityService.class );
    }
}
