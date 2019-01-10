package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.testing.ScriptTestSupport;

public class GetIdProviderHandlerTest
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
    public void testGetIdProvider()
    {
        Mockito.when( securityService.getIdProvider( IdProviderKey.from( "myIdProvider" ) ) ).thenReturn(
            TestDataFixtures.getTestIdProvider() );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getIdProvider-test.js", "getIdProvider" );
    }

    @Test
    public void testNonExistingIdProvider()
    {
        Mockito.when( securityService.getIdProvider( IdProviderKey.from( "myIdProvider" ) ) ).thenReturn( null );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getIdProvider-test.js", "getNonExistingIdProvider" );
    }
}
