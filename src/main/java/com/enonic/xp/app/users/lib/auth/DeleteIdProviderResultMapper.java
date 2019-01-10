package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class DeleteIdProviderResultMapper
    implements MapSerializable
{
    private final DeleteIdProviderResult value;

    public DeleteIdProviderResultMapper( final DeleteIdProviderResult value )
    {
        this.value = value;
    }

    private void serialize( final MapGenerator gen, final DeleteIdProviderResult value )
    {
        gen.value( "userStoreKey", value.getUserStoreKey().toString() );
        gen.value( "deleted", value.isDeleted() );
        gen.value( "reason", value.getReason() );
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        serialize( gen, this.value );
    }
}

