package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.acl.UserStoreAccess;
import com.enonic.xp.security.acl.UserStoreAccessControlEntry;
import com.enonic.xp.security.acl.UserStoreAccessControlList;
import com.enonic.xp.testing.ScriptTestSupport;

public class DefaultPermissionsHandlerTest
    extends ScriptTestSupport
{
    private SecurityService securityService;

    private UserStoreKey userStoreKey;

    private Principals principals;

    private UserStoreAccessControlList userStoreAccessControlEntries;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        securityService = Mockito.mock( SecurityService.class );
        addService( SecurityService.class, securityService );

        userStoreKey = UserStoreKey.from( "myUserStore" );

        final User user = User.create( TestDataFixtures.getTestUser() ).key( PrincipalKey.ofUser( userStoreKey, "user" ) ).build();
        principals = Principals.from( user );

        userStoreAccessControlEntries = UserStoreAccessControlList.create().
            add( UserStoreAccessControlEntry.create().principal( user.getKey() ).access( UserStoreAccess.ADMINISTRATOR ).build() ).
            build();
    }

    @Test
    public void testPermissions()
    {
        Mockito.when( securityService.getUserStore( userStoreKey ) ).thenReturn( TestDataFixtures.getTestUserStore() );
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenReturn( principals );
        Mockito.when( securityService.getDefaultUserStorePermissions() ).thenReturn( userStoreAccessControlEntries );

        runFunction( "/com/enonic/xp/app/users/lib/auth/defaultPermissions-test.js", "defaultPermissions" );
    }
}
