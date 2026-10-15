package com.enonic.xp.app.users.lib.idprovider;

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

    /** Null when no provider answers to the key, which is an answer rather than a failure. */
    public IdProviderMapper execute()
    {
        final IdProvider idProvider = securityService.get().getIdProvider( idProviderKey );

        return idProvider == null ? null : new IdProviderMapper( idProvider );
    }
}
