package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;

public final class GetIdProviderHandler
    extends AbstractIdProviderHandler
{
    private IdProviderKey userStoreKey;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = IdProviderKey.from( userStoreKey );
    }

    public IdProviderMapper getUserStore()
    {
        final IdProvider userStore = securityService.get().getIdProvider( userStoreKey );
        return userStore == null ? null : new IdProviderMapper( userStore );
    }
}
