package com.enonic.xp.app.users.lib.auth;

import org.junit.Test;
import org.mockito.Mockito;

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

public class DefaultPermissionsHandlerTest
    extends ScriptTestSupport
{
    private SecurityService securityService;

    private IdProviderKey idProviderKey;

    private Principals principals;

    private IdProviderAccessControlList idProviderAccessControlEntries;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        securityService = Mockito.mock( SecurityService.class );
        addService( SecurityService.class, securityService );

        idProviderKey = IdProviderKey.from( "myIdProvider" );

        final User user = User.create( TestDataFixtures.getTestUser() ).key( PrincipalKey.ofUser( idProviderKey, "user" ) ).build();
        principals = Principals.from( user );

        idProviderAccessControlEntries = IdProviderAccessControlList.create().
            add( IdProviderAccessControlEntry.create().principal( user.getKey() ).access( IdProviderAccess.ADMINISTRATOR ).build() ).
            build();
    }

    @Test
    public void testPermissions()
    {
        Mockito.when( securityService.getIdProvider( idProviderKey ) ).thenReturn( TestDataFixtures.getTestIdProvider() );
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenReturn( principals );
        Mockito.when( securityService.getDefaultIdProviderPermissions() ).thenReturn( idProviderAccessControlEntries );

        runFunction( "/com/enonic/xp/app/users/lib/auth/defaultPermissions-test.js", "defaultPermissions" );
    }
}
