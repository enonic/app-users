package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class DeleteUserStoreResultMapper
    implements MapSerializable
{
    private final DeleteUserStoreResult value;

    public DeleteUserStoreResultMapper( final DeleteUserStoreResult value )
    {
        this.value = value;
    }

    private void serialize( final MapGenerator gen, final DeleteUserStoreResult value )
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

