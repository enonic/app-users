package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.Group;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;
import com.enonic.xp.testing.ScriptTestSupport;

public class GetPermissionsHandlerTest
    extends ScriptTestSupport
{
    private SecurityService securityService;

    private IdProviderKey userStoreKey;

    private Principals principals;

    private IdProviderAccessControlList userStoreAccessControlEntries;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        securityService = Mockito.mock( SecurityService.class );
        addService( SecurityService.class, securityService );

        userStoreKey = IdProviderKey.from( "myUserStore" );

        final User user = User.create( TestDataFixtures.getTestUser() ).key( PrincipalKey.ofUser( userStoreKey, "user" ) ).build();
        final Group group = Group.create( TestDataFixtures.getTestGroup() ).key( PrincipalKey.ofGroup( userStoreKey, "group" ) ).build();
        principals = Principals.from( user, group );

        userStoreAccessControlEntries = IdProviderAccessControlList.create().
            add( IdProviderAccessControlEntry.create().build().create().principal( user.getKey() ).access(
                IdProviderAccess.ADMINISTRATOR ).build() ).
            add( IdProviderAccessControlEntry.create().principal( group.getKey() ).access( IdProviderAccess.CREATE_USERS ).build() ).
            build();
    }

    @Test
    public void testPermissions()
    {
        Mockito.when( securityService.getIdProvider( userStoreKey ) ).thenReturn( TestDataFixtures.getTestUserStore() );
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenReturn( principals );
        Mockito.when( securityService.getIdProviderPermissions( userStoreKey ) ).thenReturn( userStoreAccessControlEntries );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getPermissions-test.js", "getPermissions" );
    }

    @Test
    public void testNonExistingPermissions()
    {
        Mockito.when( securityService.getIdProvider( userStoreKey ) ).thenReturn( TestDataFixtures.getTestUserStore() );
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenReturn( Principals.empty() );
        Mockito.when( securityService.getIdProviderPermissions( userStoreKey ) ).thenReturn( IdProviderAccessControlList.empty() );

        runFunction( "/com/enonic/xp/app/users/lib/auth/getPermissions-test.js", "getNonExistingPermissions" );
    }
}
