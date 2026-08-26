package com.enonic.xp.app.users.lib.idprovider;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.acl.IdProviderAccess;

public final class IdProviderPermissionMapper
    implements MapSerializable
{
    private final Principal principal;

    private final IdProviderAccess access;

    public IdProviderPermissionMapper( final Principal principal, final IdProviderAccess access )
    {
        this.principal = principal;
        this.access = access;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.map( "principal" );
        gen.value( "key", principal.getKey().toString() );
        gen.value( "type", principal.getKey().getType().toString().toLowerCase() );
        gen.value( "displayName", principal.getDisplayName() );
        gen.end();

        // Absent rather than null for a principal the list grants nothing.
        if ( access != null )
        {
            gen.value( "access", access.toString() );
        }
    }
}
