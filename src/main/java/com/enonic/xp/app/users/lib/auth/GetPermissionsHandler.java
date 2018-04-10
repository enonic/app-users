package com.enonic.xp.app.users.lib.auth;

import java.util.List;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public final class GetPermissionsHandler
    extends AbstractPermissionsHandler
{
    private UserStoreKey userStoreKey;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = UserStoreKey.from( userStoreKey );
    }

    public List<UserStoreAccessControlEntryMapper> getPermissions()
    {
        final UserStore userStore = securityService.get().getUserStore( userStoreKey );

        if ( userStore != null )
        {
            final UserStoreAccessControlList userStorePermissions = securityService.get().getUserStorePermissions( userStoreKey );
            return mapUserStorePermissions( userStorePermissions );
        }

        return null;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        securityService = context.getService( SecurityService.class );
    }
}
