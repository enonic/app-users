package com.enonic.xp.app.users.lib.idprovider;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.Role;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class IdProviderPermissionsHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/idprovider/idProviderPermissions-test.js";

    private static final IdProviderKey ID_PROVIDER = IdProviderKey.from( "myIdProvider" );

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
    public void testGetIdProviderPermissions()
    {
        final IdProviderAccessControlList permissions = IdProviderAccessControlList.create()
            .add( IdProviderAccessControlEntry.create()
                      .principal( TestDataFixtures.testUser().getKey() )
                      .access( IdProviderAccess.ADMINISTRATOR )
                      .build() )
            .add( IdProviderAccessControlEntry.create()
                      .principal( TestDataFixtures.testGroup().getKey() )
                      .access( IdProviderAccess.CREATE_USERS )
                      .build() )
            .build();

        Mockito.when( securityService.getIdProvider( ID_PROVIDER ) ).thenReturn( TestDataFixtures.testIdProvider() );
        Mockito.when( securityService.getIdProviderPermissions( ID_PROVIDER ) ).thenReturn( permissions );
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) )
            .thenReturn( Principals.from( TestDataFixtures.testUser(), TestDataFixtures.testGroup() ) );

        runFunction( SCRIPT, "getIdProviderPermissions" );
    }

    @Test
    public void testNonExistingIdProvider()
    {
        Mockito.when( securityService.getIdProvider( ID_PROVIDER ) ).thenReturn( null );

        runFunction( SCRIPT, "getNonExistingIdProviderPermissions" );
    }

    @Test
    public void testDefaultIdProviderPermissions()
    {
        final Role admin = Role.create().key( RoleKeys.ADMIN ).displayName( "Administrator" ).build();

        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenReturn( Principals.from( admin ) );

        runFunction( SCRIPT, "defaultIdProviderPermissions" );

        final ArgumentCaptor<PrincipalKeys> captor = ArgumentCaptor.forClass( PrincipalKeys.class );
        Mockito.verify( securityService ).getPrincipals( captor.capture() );

        final PrincipalKeys asked = captor.getValue();

        assertEquals( 3, asked.getSize() );
        assertTrue( asked.contains( RoleKeys.ADMIN ) );
        assertTrue( asked.contains( RoleKeys.USER_MANAGER_ADMIN ) );
        assertTrue( asked.contains( RoleKeys.AUTHENTICATED ) );
    }
}
