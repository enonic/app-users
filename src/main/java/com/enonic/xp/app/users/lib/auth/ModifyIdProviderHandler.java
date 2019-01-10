package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.EditableIdProvider;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderEditor;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.UpdateIdProviderParams;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public final class ModifyIdProviderHandler
    extends AbstractIdProviderHandler
{
    private IdProviderKey idProviderKey;

    private ScriptValue editor;

    private IdProviderAccessControlList permissions;

    public void setIdProviderKey( final String idProviderKey )
    {
        this.idProviderKey = IdProviderKey.from( idProviderKey );
    }

    public void setEditor( final ScriptValue editor )
    {
        this.editor = editor;
    }

    public void setPermissions( final ScriptValue permissions )
    {
        this.permissions = permissions == null
            ? null : ScriptValueToIdProviderAccessControlListTranslator.translate( permissions, this::isPrincipalExists );
    }

    public IdProviderMapper getIdProvider()
    {
        final IdProvider idProvider = securityService.get().getIdProvider( idProviderKey );
        return idProvider == null ? null : new IdProviderMapper( idProvider );
    }

    public IdProviderMapper modifyIdProvider()
    {
        final IdProvider idProvider = securityService.get().getIdProvider( idProviderKey );

        if ( idProvider != null )
        {
            final UpdateIdProviderParams params = UpdateIdProviderParams.create().
                key( idProviderKey ).
                editor( createEditor() ).
                permissions( permissions ).
                build();

            return new IdProviderMapper( this.securityService.get().updateIdProvider( params ) );
        }
        return null;
    }

    private IdProviderEditor createEditor()
    {
        return edit -> {
            final ScriptValue value = editor.call( new IdProviderMapper( edit.source ) );
            if ( value != null )
            {
                updateIdProvider( edit, value );
            }
        };
    }

    private void updateIdProvider( final EditableIdProvider target, final ScriptValue value )
    {
        target.displayName = value.getMember( "displayName" ).getValue().toString();
        target.description = value.getMember( "description" ) == null ? null : value.getMember( "description" ).getValue().toString();
        target.idProviderConfig = value.getMember( "idProviderConfig" ) == null
            ? null
            : ScriptValueToIdProviderConfigTranslator.translate( value.getMember( "idProviderConfig" ) );
    }
}
