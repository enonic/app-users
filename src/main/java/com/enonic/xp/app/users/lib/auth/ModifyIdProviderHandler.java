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
    private IdProviderKey userStoreKey;

    private ScriptValue editor;

    private IdProviderAccessControlList permissions;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = IdProviderKey.from( userStoreKey );
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

    public IdProviderMapper getUserStore()
    {
        final IdProvider userStore = securityService.get().getIdProvider( userStoreKey );
        return userStore == null ? null : new IdProviderMapper( userStore );
    }

    public IdProviderMapper modifyUserStore()
    {
        final IdProvider userStore = securityService.get().getIdProvider( userStoreKey );

        if ( userStore != null )
        {
            final UpdateIdProviderParams params = UpdateIdProviderParams.create().
                key( userStoreKey ).
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
                updateUserStore( edit, value );
            }
        };
    }

    private void updateUserStore( final EditableIdProvider target, final ScriptValue value )
    {
        target.displayName = value.getMember( "displayName" ).getValue().toString();
        target.description = value.getMember( "description" ) == null ? null : value.getMember( "description" ).getValue().toString();
        target.idProviderConfig = value.getMember( "idProviderConfig" ) == null
            ? null
            : ScriptValueToIdProviderConfigTranslator.translate( value.getMember( "idProviderConfig" ) );
    }
}
