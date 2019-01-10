package com.enonic.xp.app.users.lib.auth;

import java.util.List;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class GetPermissionsHandler
    extends AbstractPermissionsHandler
{
    private IdProviderKey userStoreKey;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = IdProviderKey.from( userStoreKey );
    }

    public List<IdProviderAccessControlEntryMapper> getPermissions()
    {
        final IdProvider userStore = securityService.get().getIdProvider( userStoreKey );

        if ( userStore != null )
        {
            final IdProviderAccessControlList userStorePermissions = securityService.get().getIdProviderPermissions( userStoreKey );
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
