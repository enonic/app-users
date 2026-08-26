package com.enonic.xp.app.users.lib.idprovider;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.CreateIdProviderParams;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

/**
 * Creates a provider with its application binding and its permissions in one call.
 *
 * ? `lib/xp/auth` has a `createIdProvider` of its own, and this exists beside it for the reason
 * ? `IdProviderConfigMapper` gives: that one builds the config with `PropertyTree.fromMap`, which cannot
 * ? carry a `ValueType`. Everything else about the two is the same call.
 */
public final class CreateIdProviderHandler
    extends AbstractIdProviderHandler
{
    private String key;

    private String displayName;

    private String description;

    private IdProviderConfig idProviderConfig;

    private IdProviderAccessControlList permissions;

    public void setKey( final String key )
    {
        this.key = key;
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
            ? null
            : ScriptValueToIdProviderPermissionsTranslator.translate( permissions, this::principalExists );
    }

    public IdProviderMapper execute()
    {
        final CreateIdProviderParams params = CreateIdProviderParams.create()
            .key( IdProviderKey.from( key ) )
            .displayName( displayName )
            .description( description )
            .idProviderConfig( idProviderConfig )
            .permissions( permissions )
            .build();

        final IdProvider idProvider = securityService.get().createIdProvider( params );

        return idProvider == null ? null : new IdProviderMapper( idProvider );
    }
}
