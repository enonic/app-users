package com.enonic.xp.app.users.lib.idprovider;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.EditableIdProvider;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UpdateIdProviderParams;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

public class UpdateIdProviderHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/idprovider/updateIdProvider-test.js";

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
    public void testUpdateIdProvider()
    {
        Mockito.<Optional<? extends Principal>>when( securityService.getPrincipal( Mockito.any() ) )
            .thenReturn( Optional.empty() )
            .thenReturn( Optional.of( TestDataFixtures.testGroup() ) );

        Mockito.when( securityService.updateIdProvider( Mockito.isA( UpdateIdProviderParams.class ) ) )
            .thenAnswer( invocation -> {
                final UpdateIdProviderParams params = invocation.getArgument( 0 );
                assertPermissions( params.getIdProviderPermissions() );
                return edit( params, TestDataFixtures.blankIdProvider() );
            } );

        runFunction( SCRIPT, "updateIdProvider" );
    }

    @Test
    public void testClearIdProvider()
    {
        Mockito.when( securityService.updateIdProvider( Mockito.isA( UpdateIdProviderParams.class ) ) )
            .thenAnswer( invocation -> {
                final UpdateIdProviderParams params = invocation.getArgument( 0 );
                // Permissions left out of the call are left alone rather than emptied.
                assertNull( params.getIdProviderPermissions() );
                return edit( params, TestDataFixtures.testIdProvider() );
            } );

        runFunction( SCRIPT, "clearIdProvider" );
    }

    @Test
    public void testNonExistingIdProvider()
    {
        Mockito.when( securityService.updateIdProvider( Mockito.isA( UpdateIdProviderParams.class ) ) ).thenReturn( null );

        runFunction( SCRIPT, "updateNonExistingIdProvider" );
    }

    private void assertPermissions( final IdProviderAccessControlList permissions )
    {
        assertNotNull( permissions );

        final IdProviderAccessControlEntry entry = permissions.getEntry( PrincipalKey.from( "group:myIdProvider:group" ) );

        assertNotNull( entry );
        assertEquals( IdProviderAccess.CREATE_USERS, entry.getAccess() );
        assertEquals( 1, permissions.getAllPrincipals().getSize() );
    }

    /** What `SecurityServiceImpl` does with the editor: run it over the stored provider, store the result. */
    private IdProvider edit( final UpdateIdProviderParams params, final IdProvider stored )
    {
        final EditableIdProvider editable = new EditableIdProvider( stored );
        params.getEditor().edit( editable );
        return editable.build();
    }
}
