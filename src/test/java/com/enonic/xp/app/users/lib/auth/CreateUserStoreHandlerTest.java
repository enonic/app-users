package com.enonic.xp.app.users.lib.auth;

import java.util.Optional;

import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.security.CreateUserStoreParams;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.UserStoreAccess;
import com.enonic.xp.security.acl.UserStoreAccessControlEntry;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.Assert.*;

public class CreateUserStoreHandlerTest
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
    public void testCreateUserStore()
    {
        Mockito.when( securityService.createUserStore( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestUserStore() );
        Mockito.when( securityService.getPrincipal( Mockito.any() ) ).thenReturn( Optional.empty() ).thenReturn(
            (Optional) Optional.of( TestDataFixtures.getTestGroup() ) );

        runFunction( "/com/enonic/xp/app/users/lib/auth/createUserStore-test.js", "createUserStore" );

        ArgumentCaptor<CreateUserStoreParams> issueParamsArgumentCaptor = ArgumentCaptor.forClass( CreateUserStoreParams.class );
        Mockito.verify( securityService ).createUserStore( issueParamsArgumentCaptor.capture() );

        final CreateUserStoreParams params = issueParamsArgumentCaptor.getValue();

        assertNotNull( params );
        assertEquals( "User store test", params.getDisplayName() );
        assertEquals( "User store used for testing", params.getDescription() );
        assertEquals( "com.enonic.app.test", params.getAuthConfig().getApplicationKey().toString() );
        assertEquals( "App Title", params.getAuthConfig().getConfig().getString( "title" ) );
        assertEquals( "noreply@example.com", params.getAuthConfig().getConfig().getSet( "forgotPassword" ).getString( "email" ) );
        final UserStoreAccessControlEntry entry =
            params.getUserStorePermissions().getEntry( PrincipalKey.from( "group:myUserStore:group" ) );
        assertNotNull( entry );
        assertEquals( entry.getAccess(), UserStoreAccess.CREATE_USERS );
        assertEquals( params.getUserStorePermissions().getAllPrincipals().getSize(), 1 );
    }

    @Test
    public void testCreateUserStoreByName()
    {
        Mockito.when( securityService.createUserStore( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestUserStore() );

        runFunction( "/com/enonic/xp/app/users/lib/auth/createUserStore-test.js", "createUserStoreByName" );

        ArgumentCaptor<CreateUserStoreParams> issueParamsArgumentCaptor = ArgumentCaptor.forClass( CreateUserStoreParams.class );
        Mockito.verify( securityService ).createUserStore( issueParamsArgumentCaptor.capture() );

        assertEquals( "myUserStore", issueParamsArgumentCaptor.getValue().getDisplayName() );
    }
}
