package com.enonic.xp.app.users.lib.idprovider;

import java.util.List;

import com.enonic.xp.security.IdProviderKey;

public final class GetIdProviderPermissionsHandler
    extends AbstractIdProviderPermissionsHandler
{
    private IdProviderKey idProviderKey;

    public void setIdProviderKey( final String idProviderKey )
    {
        this.idProviderKey = IdProviderKey.from( idProviderKey );
    }

    /** Null when no provider answers to the key, which is an answer rather than a failure. */
    public List<IdProviderPermissionMapper> execute()
    {
        if ( securityService.get().getIdProvider( idProviderKey ) == null )
        {
            return null;
        }

        return map( securityService.get().getIdProviderPermissions( idProviderKey ) );
    }
}
