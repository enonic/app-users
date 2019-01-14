package com.enonic.xp.app.users.lib.auth;

import java.util.List;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class DefaultPermissionsHandler
    extends AbstractPermissionsHandler
{
    public List<IdProviderAccessControlEntryMapper> defaultPermissions()
    {
        final IdProviderAccessControlList idProviderPermissions = securityService.get().getDefaultIdProviderPermissions();
        return mapIdProviderPermissions( idProviderPermissions );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        securityService = context.getService( SecurityService.class );
    }
}
