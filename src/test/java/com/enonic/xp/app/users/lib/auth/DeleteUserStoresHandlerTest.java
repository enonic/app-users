package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.UserStoreNotFoundException;
import com.enonic.xp.testing.ScriptTestSupport;

public class DeleteUserStoresHandlerTest
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
        final UserStoreKey nonExistingUserStoreKey = UserStoreKey.from( "invalid" );
        Mockito.doThrow( new UserStoreNotFoundException( nonExistingUserStoreKey ) ).when( securityService ).deleteUserStore(
            nonExistingUserStoreKey );

        runFunction( "/com/enonic/xp/app/users/lib/auth/deleteUserStores-test.js", "deleteUserStores" );
    }
}
