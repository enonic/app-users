package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.testing.ScriptTestSupport;

public class GetUserStoreHandlerTest
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
    public void testGetUserStore()
    {
        Mockito.when( securityService.getUserStore( UserStoreKey.from( "myUserStore" ) ) ).thenReturn(
            TestDataFixtures.getTestUserStore() );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getUserStore-test.js", "getUserStore" );
    }

    @Test
    public void testNonExistingUserStore()
    {
        Mockito.when( securityService.getUserStore( UserStoreKey.from( "myUserStore" ) ) ).thenReturn( null );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getUserStore-test.js", "getNonExistingUserStore" );
    }
}
