package com.enonic.xp.app.users.lib.idprovider;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;

public final class IdProviderMapper
    implements MapSerializable
{
    private final IdProvider idProvider;

    public IdProviderMapper( final IdProvider idProvider )
    {
        this.idProvider = idProvider;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "key", idProvider.getKey() );
        gen.value( "displayName", idProvider.getDisplayName() );
        gen.value( "description", idProvider.getDescription() );
        serializeIdProviderConfig( gen, idProvider.getIdProviderConfig() );
    }

    // Absent rather than null for a provider bound to no application: it serves no login at all, which
    // is a different answer from "bound, with an empty config".
    private void serializeIdProviderConfig( final MapGenerator gen, final IdProviderConfig config )
    {
        if ( config == null )
        {
            return;
        }

        gen.map( "idProviderConfig" );
        new IdProviderConfigMapper( config ).serialize( gen );
        gen.end();
    }
}
