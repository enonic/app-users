package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.AuthConfig;
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
        serializeAuthConfig( gen, value.getAuthConfig() );
    }

    private void serializeAuthConfig( final MapGenerator gen, final AuthConfig value )
    {
        if ( value != null )
        {
            gen.map( "authConfig" );
            new AuthConfigMapper( value ).serialize( gen );
            gen.end();
        }
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        serialize( gen, this.value );
    }
}

