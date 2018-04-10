package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.AuthConfig;
import com.enonic.xp.security.CreateUserStoreParams;
import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public final class CreateUserStoreHandler
    extends AbstractUserStoreHandler
{
    private String name;

    private String displayName;

    private String description;

    private AuthConfig authConfig;

    private UserStoreAccessControlList permissions;

    public void setName( final String name )
    {
        this.name = name;
    }

    public void setDisplayName( final String displayName )
    {
        this.displayName = displayName;
    }

    public void setDescription( final String description )
    {
        this.description = description;
    }

    public void setAuthConfig( final ScriptValue authConfig )
    {
        this.authConfig = authConfig == null ? null : ScriptValueToAuthConfigTranslator.translate( authConfig );
    }

    public void setPermissions( final ScriptValue permissions )
    {
        this.permissions = permissions == null
            ? null
            : ScriptValueToUserStoreAccessControlListTranslator.translate( permissions, this::isPrincipalExists );
    }

    public UserStoreMapper createUserStore()
    {
        final String displayName = this.displayName == null ? this.name : this.displayName;
        final CreateUserStoreParams params = CreateUserStoreParams.create().
            key( UserStoreKey.from( name ) ).
            displayName( displayName ).
            description( description ).
            authConfig( authConfig ).
            permissions( permissions ).
            build();
        final UserStore userStore = securityService.get().createUserStore( params );
        return userStore == null ? null : new UserStoreMapper( userStore );
    }
}
