package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.EditableUserStore;
import com.enonic.xp.security.UpdateUserStoreParams;
import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreEditor;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public final class ModifyUserStoreHandler
    extends AbstractUserStoreHandler
{
    private UserStoreKey userStoreKey;

    private ScriptValue editor;

    private UserStoreAccessControlList permissions;

    public void setUserStoreKey( final String userStoreKey )
    {
        this.userStoreKey = UserStoreKey.from( userStoreKey );
    }

    public void setEditor( final ScriptValue editor )
    {
        this.editor = editor;
    }

    public void setPermissions( final ScriptValue permissions )
    {
        this.permissions = permissions == null
            ? null
            : ScriptValueToUserStoreAccessControlListTranslator.translate( permissions, this::isPrincipalExists );
    }

    public UserStoreMapper getUserStore()
    {
        final UserStore userStore = securityService.get().getUserStore( userStoreKey );
        return userStore == null ? null : new UserStoreMapper( userStore );
    }

    public UserStoreMapper modifyUserStore()
    {
        final UserStore userStore = securityService.get().getUserStore( userStoreKey );

        if ( userStore != null )
        {
            final UpdateUserStoreParams params = UpdateUserStoreParams.create().
                key( userStoreKey ).
                editor( createEditor() ).
                permissions( permissions ).
                build();

            return new UserStoreMapper( this.securityService.get().updateUserStore( params ) );
        }
        return null;
    }

    private UserStoreEditor createEditor()
    {
        return edit -> {
            final ScriptValue value = editor.call( new UserStoreMapper( edit.source ) );
            if ( value != null )
            {
                updateUserStore( edit, value );
            }
        };
    }

    private void updateUserStore( final EditableUserStore target, final ScriptValue value )
    {
        target.displayName = value.getMember( "displayName" ).getValue().toString();
        target.description = value.getMember( "description" ) == null ? null : value.getMember( "description" ).getValue().toString();
        target.idProviderConfig = value.getMember( "idProviderConfig" ) == null
            ? null
            : ScriptValueToIdProviderConfigTranslator.translate( value.getMember( "idProviderConfig" ) );
    }
}
