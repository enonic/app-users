package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.UserStoreKey;

public final class DeleteUserStoresHandler
    extends AbstractUserStoreHandler
{
    private ScriptValue userStoreKeys;

    public void setUserStoreKeys( final ScriptValue userStoreKeys )
    {
        this.userStoreKeys = userStoreKeys;
    }

    public List<DeleteUserStoreResultMapper> deleteUserStores()
    {
        return userStoreKeys.getArray( String.class ).stream().map( key -> {
            final UserStoreKey userStoreKey = UserStoreKey.from( key );
            final DeleteUserStoreResult.Builder result = DeleteUserStoreResult.create( userStoreKey );
            try
            {
                securityService.get().deleteUserStore( userStoreKey );
                result.deleted( true );
            }
            catch ( Exception e )
            {
                result.deleted( false ).reason( e.getMessage() );
            }
            return new DeleteUserStoreResultMapper( result.build() );
        } ).collect( Collectors.toList() );
    }
}
