package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.security.UserStores;

public final class GetUserStoresHandler
    extends AbstractUserStoreHandler
{
    public List<UserStoreMapper> getUserStores()
    {
        final UserStores userStores = securityService.get().getUserStores();
        return userStores.stream().
            map( userStore -> new UserStoreMapper( userStore ) ).
            collect( Collectors.toList() );
    }
}
