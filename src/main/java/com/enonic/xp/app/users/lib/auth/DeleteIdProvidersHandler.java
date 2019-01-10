package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProviderKey;

public final class DeleteIdProvidersHandler
    extends AbstractIdProviderHandler
{
    private ScriptValue idProviderKeys;

    public void setIdProviderKeys( final ScriptValue idProviderKeys )
    {
        this.idProviderKeys = idProviderKeys;
    }

    public List<DeleteIdProviderResultMapper> deleteIdProviders()
    {
        return idProviderKeys.getArray( String.class ).stream().map( key -> {
            final IdProviderKey idProviderKey = IdProviderKey.from( key );
            final DeleteIdProviderResult.Builder result = DeleteIdProviderResult.create( idProviderKey );
            try
            {
                securityService.get().deleteIdProvider( idProviderKey );
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
