package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.acl.UserStoreAccess;
import com.enonic.xp.security.acl.UserStoreAccessControlEntry;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public final class ScriptValueToUserStoreAccessControlListTranslator
{
    public static UserStoreAccessControlList translate( final ScriptValue value, final Function<PrincipalKey, Boolean> isPrincipalExists )
    {
        final List<UserStoreAccessControlEntry> entries = value.getArray().stream().
            map( scriptValue -> ScriptValueToUserStoreAccessControlListTranslator.mapAccessControlEntry( scriptValue, isPrincipalExists ) ).
            filter( Objects::nonNull ).
            collect( Collectors.toList() );
        return UserStoreAccessControlList.create().addAll( entries ).build();
    }

    private static UserStoreAccessControlEntry mapAccessControlEntry( ScriptValue scriptValue,
                                                                      final Function<PrincipalKey, Boolean> isPrincipalExist )
    {
        final String principalValue =
            scriptValue.hasMember( "principal" ) ? scriptValue.getMember( "principal" ).getValue().toString() : null;
        final String accessValue = scriptValue.hasMember( "access" ) ? scriptValue.getMember( "access" ).getValue().toString() : null;

        final PrincipalKey principalKey = principalValue == null ? null : PrincipalKey.from( principalValue );
        final UserStoreAccess access = UserStoreAccess.valueOf( accessValue );

        final boolean hasPrincipal = principalValue != null && isPrincipalExist.apply( principalKey );

        return hasPrincipal ? UserStoreAccessControlEntry.create().principal( principalKey ).access( access ).build() : null;
    }
}
