package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.UserStore;

public final class UserStoreMapper
    implements MapSerializable
{
    private final UserStore value;

    public UserStoreMapper( final UserStore value )
    {
        this.value = value;
    }

    private void serialize( final MapGenerator gen, final UserStore value )
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

