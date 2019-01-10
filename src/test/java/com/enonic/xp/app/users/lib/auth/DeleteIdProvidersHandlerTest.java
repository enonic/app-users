package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.IdProviderNotFoundException;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.testing.ScriptTestSupport;

public class DeleteIdProvidersHandlerTest
    extends ScriptTestSupport
{
    private SecurityService securityService;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        this.securityService = Mockito.mock( SecurityService.class );
        addService( SecurityService.class, this.securityService );
    }

    @Test
    public void testDeleteUserStores()
    {
        final IdProviderKey nonExistingUserStoreKey = IdProviderKey.from( "invalid" );
        Mockito.doThrow( new IdProviderNotFoundException( nonExistingUserStoreKey ) ).when( securityService ).deleteIdProvider(
            nonExistingUserStoreKey );

        runFunction( "/com/enonic/xp/app/users/lib/auth/deleteUserStores-test.js", "deleteUserStores" );
    }
}
