package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class ScriptValueToIdProviderAccessControlListTranslator
{
    public static IdProviderAccessControlList translate( final ScriptValue value, final Function<PrincipalKey, Boolean> isPrincipalExists )
    {
        final List<IdProviderAccessControlEntry> entries = value.getArray().stream().
            map(
                scriptValue -> ScriptValueToIdProviderAccessControlListTranslator.mapAccessControlEntry( scriptValue, isPrincipalExists ) ).
            filter( Objects::nonNull ).
            collect( Collectors.toList() );
        return IdProviderAccessControlList.create().addAll( entries ).build();
    }

    private static IdProviderAccessControlEntry mapAccessControlEntry( ScriptValue scriptValue,
                                                                       final Function<PrincipalKey, Boolean> isPrincipalExist )
    {
        final String principalValue =
            scriptValue.hasMember( "principal" ) ? scriptValue.getMember( "principal" ).getValue().toString() : null;
        final String accessValue = scriptValue.hasMember( "access" ) ? scriptValue.getMember( "access" ).getValue().toString() : null;

        final PrincipalKey principalKey = principalValue == null ? null : PrincipalKey.from( principalValue );
        final IdProviderAccess access = IdProviderAccess.valueOf( accessValue );

        final boolean hasPrincipal = principalValue != null && isPrincipalExist.apply( principalKey );

        return hasPrincipal ? IdProviderAccessControlEntry.create().principal( principalKey ).access( access ).build() : null;
    }
}
