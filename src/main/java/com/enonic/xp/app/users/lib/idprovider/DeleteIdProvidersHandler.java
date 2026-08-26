package com.enonic.xp.app.users.lib.idprovider;

import java.util.ArrayList;
import java.util.List;

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

    /**
     * One result per key, in the order asked.
     *
     * ! A failure is a value here, not a thrown error: deleting several providers is one call and the
     * ! second must not be lost because the first refused. `deleteIdProvider` throws for a key nothing
     * ! answers to and for a provider the platform will not part with, and the message is the only thing
     * ! that says which.
     */
    public List<DeleteIdProviderResultMapper> execute()
    {
        final List<DeleteIdProviderResultMapper> results = new ArrayList<>();

        for ( final String key : idProviderKeys.getArray( String.class ) )
        {
            results.add( delete( IdProviderKey.from( key ) ) );
        }

        return results;
    }

    private DeleteIdProviderResultMapper delete( final IdProviderKey idProviderKey )
    {
        try
        {
            securityService.get().deleteIdProvider( idProviderKey );
            return new DeleteIdProviderResultMapper( idProviderKey, true, null );
        }
        catch ( Exception e )
        {
            return new DeleteIdProviderResultMapper( idProviderKey, false, e.getMessage() );
        }
    }
}
