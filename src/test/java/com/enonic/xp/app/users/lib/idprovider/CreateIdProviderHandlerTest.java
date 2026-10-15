package com.enonic.xp.app.users.lib.idprovider;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.security.CreateIdProviderParams;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreateIdProviderHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/idprovider/createIdProvider-test.js";

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
    public void testCreateIdProvider()
    {
        Mockito.when( securityService.createIdProvider( Mockito.any() ) ).thenReturn( TestDataFixtures.testIdProvider() );

        // The first principal the entries name is gone, the second is there — one call each, in order.
        Mockito.<Optional<? extends Principal>>when( securityService.getPrincipal( Mockito.any() ) )
            .thenReturn( Optional.empty() )
            .thenReturn( Optional.of( TestDataFixtures.testGroup() ) );

        runFunction( SCRIPT, "createIdProvider" );

        final CreateIdProviderParams params = capturedParams();

        assertEquals( "myIdProvider", params.getKey().toString() );
        assertEquals( "Id provider test", params.getDisplayName() );
        assertEquals( "Id provider used for testing", params.getDescription() );

        final PropertyTree config = params.getIdProviderConfig().getConfig();

        assertEquals( "com.enonic.app.test", params.getIdProviderConfig().getApplicationKey().toString() );
        assertEquals( "App Title", config.getString( "title" ) );
        assertEquals( "noreply@example.com", config.getSet( "forgotPassword" ).getString( "email" ) );

        // What a plain map could not carry: the type stays what the form declared, empty or not.
        assertEquals( ValueTypes.REFERENCE, config.getProperty( "defaultGroups" ).getType() );
        assertEquals( ValueTypes.LONG, config.getProperty( "sessionTimeout" ).getType() );
        assertNull( config.getLong( "sessionTimeout" ) );

        // The entry naming the principal that no longer exists never reaches the platform.
        final IdProviderAccessControlEntry entry =
            params.getIdProviderPermissions().getEntry( PrincipalKey.from( "group:myIdProvider:group" ) );

        assertNotNull( entry );
        assertEquals( IdProviderAccess.CREATE_USERS, entry.getAccess() );
        assertEquals( 1, params.getIdProviderPermissions().getAllPrincipals().getSize() );
    }

    @Test
    public void testCreateUnboundIdProvider()
    {
        Mockito.when( securityService.createIdProvider( Mockito.any() ) ).thenReturn( TestDataFixtures.blankIdProvider() );

        runFunction( SCRIPT, "createUnboundIdProvider" );

        final CreateIdProviderParams params = capturedParams();

        assertNull( params.getIdProviderConfig() );

        // The params turn a null list into an empty one, so a provider created without permissions is
        // reachable through the root permissions alone.
        assertTrue( params.getIdProviderPermissions().isEmpty() );
    }

    private CreateIdProviderParams capturedParams()
    {
        final ArgumentCaptor<CreateIdProviderParams> captor = ArgumentCaptor.forClass( CreateIdProviderParams.class );
        Mockito.verify( securityService ).createIdProvider( captor.capture() );
        return captor.getValue();
    }
}
