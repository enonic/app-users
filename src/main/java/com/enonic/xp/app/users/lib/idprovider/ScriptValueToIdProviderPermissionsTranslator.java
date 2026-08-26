package com.enonic.xp.app.users.lib.idprovider;

import java.util.function.Predicate;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class ScriptValueToIdProviderPermissionsTranslator
{
    private ScriptValueToIdProviderPermissionsTranslator()
    {
    }

    /**
     * ! An entry naming a principal that no longer exists is dropped rather than written. A relationship to
     * ! a deleted principal is one nothing can undo through the UI — it reads back as an access level with
     * ! no name beside it — and a dialog open while somebody else deletes a group is enough to produce one.
     */
    public static IdProviderAccessControlList translate( final ScriptValue permissions, final Predicate<PrincipalKey> principalExists )
    {
        final IdProviderAccessControlList.Builder entries = IdProviderAccessControlList.create();

        for ( final ScriptValue entry : permissions.getArray() )
        {
            final PrincipalKey principal = principalOf( entry );

            if ( principal != null && principalExists.test( principal ) )
            {
                entries.add( IdProviderAccessControlEntry.create().principal( principal ).access( accessOf( entry ) ).build() );
            }
        }

        return entries.build();
    }

    private static PrincipalKey principalOf( final ScriptValue entry )
    {
        return entry.hasMember( "principal" )
            ? PrincipalKey.from( entry.getMember( "principal" ).getValue( String.class ) )
            : null;
    }

    private static IdProviderAccess accessOf( final ScriptValue entry )
    {
        return IdProviderAccess.valueOf( entry.getMember( "access" ).getValue( String.class ) );
    }
}
