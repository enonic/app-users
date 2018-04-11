package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreKey;

public final class GetUserStoreHandler
    extends AbstractUserStoreHandler
{
    private UserStoreKey userStoreKey;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = UserStoreKey.from( userStoreKey );
    }

    public UserStoreMapper getUserStore()
    {
        final UserStore userStore = securityService.get().getUserStore( userStoreKey );
        return userStore == null ? null : new UserStoreMapper( userStore );
    }
}
