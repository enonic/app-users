package com.enonic.xp.app.users.lib.auth;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.security.CreateIdProviderParams;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class CreateIdProviderHandlerTest
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
    public void testCreateIdProvider()
    {
        Mockito.when( securityService.createIdProvider( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestIdProvider() );
        Mockito.when( securityService.getPrincipal( Mockito.any() ) ).thenReturn( Optional.empty() ).thenReturn(
            (Optional) Optional.of( TestDataFixtures.getTestGroup() ) );

        runFunction( "/com/enonic/xp/app/users/lib/auth/createIdProvider-test.js", "createIdProvider" );

        ArgumentCaptor<CreateIdProviderParams> issueParamsArgumentCaptor = ArgumentCaptor.forClass( CreateIdProviderParams.class );
        Mockito.verify( securityService ).createIdProvider( issueParamsArgumentCaptor.capture() );

        final CreateIdProviderParams params = issueParamsArgumentCaptor.getValue();

        assertNotNull( params );
        assertEquals( "Id provider test", params.getDisplayName() );
        assertEquals( "Id provider used for testing", params.getDescription() );
        assertEquals( "com.enonic.app.test", params.getIdProviderConfig().getApplicationKey().toString() );
        assertEquals( "App Title", params.getIdProviderConfig().getConfig().getString( "title" ) );
        assertEquals( "noreply@example.com", params.getIdProviderConfig().getConfig().getSet( "forgotPassword" ).getString( "email" ) );
        final IdProviderAccessControlEntry entry =
            params.getIdProviderPermissions().getEntry( PrincipalKey.from( "group:myIdProvider:group" ) );
        assertNotNull( entry );
        assertEquals( entry.getAccess(), IdProviderAccess.CREATE_USERS );
        assertEquals( params.getIdProviderPermissions().getAllPrincipals().getSize(), 1 );
    }

    @Test
    public void testCreateIdProviderByName()
    {
        Mockito.when( securityService.createIdProvider( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestIdProvider() );

        runFunction( "/com/enonic/xp/app/users/lib/auth/createIdProvider-test.js", "createIdProviderByName" );

        ArgumentCaptor<CreateIdProviderParams> issueParamsArgumentCaptor = ArgumentCaptor.forClass( CreateIdProviderParams.class );
        Mockito.verify( securityService ).createIdProvider( issueParamsArgumentCaptor.capture() );

        assertEquals( "myIdProvider", issueParamsArgumentCaptor.getValue().getDisplayName() );
    }
}
