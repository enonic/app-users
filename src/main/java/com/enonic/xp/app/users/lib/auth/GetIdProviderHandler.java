package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;

public final class GetIdProviderHandler
    extends AbstractIdProviderHandler
{
    private IdProviderKey idProviderKey;

    public void setIdProviderKey( final String idProviderKey )
    {
        this.idProviderKey = IdProviderKey.from( idProviderKey );
    }

    public IdProviderMapper getIdProvider()
    {
        final IdProvider idProvider = securityService.get().getIdProvider( idProviderKey );
        return idProvider == null ? null : new IdProviderMapper( idProvider );
    }
}
