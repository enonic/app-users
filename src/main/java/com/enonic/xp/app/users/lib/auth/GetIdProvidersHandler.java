package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.security.IdProviders;

public final class GetIdProvidersHandler
    extends AbstractIdProviderHandler
{
    public List<IdProviderMapper> getIdProviders()
    {
        final IdProviders idProviders = securityService.get().getIdProviders();
        return idProviders.stream().
            map( idProvider -> new IdProviderMapper( idProvider ) ).
            collect( Collectors.toList() );
    }
}
