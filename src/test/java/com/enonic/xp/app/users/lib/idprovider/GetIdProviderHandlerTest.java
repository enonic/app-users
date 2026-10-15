package com.enonic.xp.app.users.lib.idprovider;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.testing.ScriptTestSupport;

public class GetIdProviderHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/idprovider/getIdProvider-test.js";

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
        Mockito.when( securityService.getIdProvider( IdProviderKey.from( "myIdProvider" ) ) )
            .thenReturn( TestDataFixtures.testIdProvider() );

        runFunction( SCRIPT, "getIdProvider" );
    }

    @Test
    public void testNonExistingIdProvider()
    {
        Mockito.when( securityService.getIdProvider( IdProviderKey.from( "myIdProvider" ) ) ).thenReturn( null );

        runFunction( SCRIPT, "getNonExistingIdProvider" );
    }
}
