package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProviderKey;

public final class DeleteIdProvidersHandler
    extends AbstractIdProviderHandler
{
    private ScriptValue userStoreKeys;

    public void setUserStoreKeys( final ScriptValue userStoreKeys )
    {
        this.userStoreKeys = userStoreKeys;
    }

    public List<DeleteIdProviderResultMapper> deleteUserStores()
    {
        return userStoreKeys.getArray( String.class ).stream().map( key -> {
            final IdProviderKey userStoreKey = IdProviderKey.from( key );
            final DeleteIdProviderResult.Builder result = DeleteIdProviderResult.create( userStoreKey );
            try
            {
                securityService.get().deleteIdProvider( userStoreKey );
                result.deleted( true );
            }
            catch ( Exception e )
            {
                result.deleted( false ).reason( e.getMessage() );
            }
            return new DeleteIdProviderResultMapper( result.build() );
        } ).collect( Collectors.toList() );
    }
}
