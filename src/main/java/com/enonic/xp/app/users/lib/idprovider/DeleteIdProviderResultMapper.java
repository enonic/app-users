package com.enonic.xp.app.users.lib.idprovider;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.IdProviderKey;

public final class DeleteIdProviderResultMapper
    implements MapSerializable
{
    private final IdProviderKey idProviderKey;

    private final boolean deleted;

    private final String reason;

    public DeleteIdProviderResultMapper( final IdProviderKey idProviderKey, final boolean deleted, final String reason )
    {
        this.idProviderKey = idProviderKey;
        this.deleted = deleted;
        this.reason = reason;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "key", idProviderKey.toString() );
        gen.value( "deleted", deleted );

        // Absent for a provider that is gone: there is nothing to explain, and the bridge drops a null.
        if ( reason != null )
        {
            gen.value( "reason", reason );
        }
    }
}
