package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.security.IdProviders;

public final class GetIdProvidersHandler
    extends AbstractIdProviderHandler
{
    public List<IdProviderMapper> getUserStores()
    {
        final IdProviders userStores = securityService.get().getIdProviders();
        return userStores.stream().
            map( userStore -> new IdProviderMapper( userStore ) ).
            collect( Collectors.toList() );
    }
}
