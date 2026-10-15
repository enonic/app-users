package com.enonic.xp.app.users.lib.idprovider;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.IdProviderEditor;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.UpdateIdProviderParams;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

/**
 * Writes the scalars, the application binding and — when asked — the permissions of one provider.
 *
 * The caller states what the provider is to hold rather than what moved, because a provider has one of
 * each: there is no list to diff, and the dialog has read every field it sends. Permissions are the
 * exception only in that omitting them leaves them alone, which is what `SecurityServiceImpl` does with a
 * null list.
 */
public final class UpdateIdProviderHandler
    extends AbstractIdProviderHandler
{
    private IdProviderKey idProviderKey;

    private String displayName;

    private String description;

    private IdProviderConfig idProviderConfig;

    private IdProviderAccessControlList permissions;

    public void setIdProviderKey( final String idProviderKey )
    {
        this.idProviderKey = IdProviderKey.from( idProviderKey );
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

    /** Null when no provider answers to the key — `updateIdProvider` answers that way rather than throwing. */
    public IdProviderMapper execute()
    {
        final UpdateIdProviderParams params = UpdateIdProviderParams.create()
            .key( idProviderKey )
            .editor( editor() )
            .permissions( permissions )
            .build();

        final IdProvider idProvider = securityService.get().updateIdProvider( params );

        return idProvider == null ? null : new IdProviderMapper( idProvider );
    }

    // ! An editor rather than the params' own fields: `UpdateIdProviderParams.update` applies a field only
    // ! when it is non-null, so without one a description cannot be cleared and a provider cannot be
    // ! unbound from its application.
    private IdProviderEditor editor()
    {
        return edit -> {
            edit.displayName = displayName;
            edit.description = description;
            edit.idProviderConfig = idProviderConfig;
        };
    }
}
