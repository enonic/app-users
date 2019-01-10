package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.CreateIdProviderParams;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class CreateIdProviderHandler
    extends AbstractIdProviderHandler
{
    private String name;

    private String displayName;

    private String description;

    private IdProviderConfig idProviderConfig;

    private IdProviderAccessControlList permissions;

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

    public void setIdProviderConfig( final ScriptValue idProviderConfig )
    {
        this.idProviderConfig = idProviderConfig == null ? null : ScriptValueToIdProviderConfigTranslator.translate( idProviderConfig );
    }

    public void setPermissions( final ScriptValue permissions )
    {
        this.permissions = permissions == null
            ? null : ScriptValueToIdProviderAccessControlListTranslator.translate( permissions, this::isPrincipalExists );
    }

    public IdProviderMapper createIdProvider()
    {
        final String displayName = this.displayName == null ? this.name : this.displayName;
        final CreateIdProviderParams params = CreateIdProviderParams.create().
            key( IdProviderKey.from( name ) ).
            displayName( displayName ).
            description( description ).
            idProviderConfig( idProviderConfig ).
            permissions( permissions ).
            build();
        final IdProvider userStore = securityService.get().createIdProvider( params );
        return userStore == null ? null : new IdProviderMapper( userStore );
    }
}
