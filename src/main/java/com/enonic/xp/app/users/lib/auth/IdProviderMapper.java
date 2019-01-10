package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;

public final class IdProviderMapper
    implements MapSerializable
{
    private final IdProvider value;

    public IdProviderMapper( final IdProvider value )
    {
        this.value = value;
    }

    private void serialize( final MapGenerator gen, final IdProvider value )
    {
        gen.value( "key", value.getKey() );
        gen.value( "displayName", value.getDisplayName() );
        gen.value( "description", value.getDescription() );
        serializeIdProviderConfig( gen, value.getIdProviderConfig() );
    }

    private void serializeIdProviderConfig( final MapGenerator gen, final IdProviderConfig value )
    {
        if ( value != null )
        {
            gen.map( "idProviderConfig" );
            new IdProviderConfigMapper( value ).serialize( gen );
            gen.end();
        }
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        serialize( gen, this.value );
    }
}

