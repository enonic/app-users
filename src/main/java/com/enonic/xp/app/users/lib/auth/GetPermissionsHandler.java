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
    private IdProviderKey idProviderKey;

    public void setIdProviderKey( final String idProviderKey )
    {
        this.idProviderKey = IdProviderKey.from( idProviderKey );
    }

    public List<IdProviderAccessControlEntryMapper> getPermissions()
    {
        final IdProvider idProvider = securityService.get().getIdProvider( idProviderKey );

        if ( idProvider != null )
        {
            final IdProviderAccessControlList idProviderPermissions = securityService.get().getIdProviderPermissions( idProviderKey );
            return mapIdProviderPermissions( idProviderPermissions );
        }

        return null;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        securityService = context.getService( SecurityService.class );
    }
}
