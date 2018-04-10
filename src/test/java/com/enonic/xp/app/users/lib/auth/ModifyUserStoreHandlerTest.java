package com.enonic.xp.app.users.lib.auth;

import java.util.Optional;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.EditableUserStore;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UpdateUserStoreParams;
import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreEditor;
import com.enonic.xp.security.acl.UserStoreAccess;
import com.enonic.xp.security.acl.UserStoreAccessControlEntry;
import com.enonic.xp.security.acl.UserStoreAccessControlList;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.Assert.*;

public class ModifyUserStoreHandlerTest
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
    public void testModifyUserStore()
    {
        Mockito.when( securityService.getUserStore( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestBlankUserStore() );
        Mockito.when( securityService.getPrincipal( Mockito.any() ) ).thenReturn( Optional.empty() ).thenReturn(
            (Optional) Optional.of( TestDataFixtures.getTestGroup() ) );
        Mockito.when( securityService.updateUserStore( Mockito.isA( UpdateUserStoreParams.class ) ) ).thenAnswer(
            invocationOnMock -> invokeUpdate( (UpdateUserStoreParams) invocationOnMock.getArguments()[0] ) );

        runFunction( "/com/enonic/xp/app/users/lib/auth/modifyUserStore-test.js", "modifyUserStore" );
    }

    private UserStore invokeUpdate( final UpdateUserStoreParams params )
    {
        final UserStoreEditor editor = params.getEditor();
        Assert.assertNotNull( editor );

        final UserStoreAccessControlList permissions = params.getUserStorePermissions();
        Assert.assertNotNull( "Permissions should not be empty", permissions );
        final UserStoreAccessControlEntry entry = permissions.getEntry( PrincipalKey.from( "group:myUserStore:group" ) );
        assertNotNull( entry );
        assertEquals( entry.getAccess(), UserStoreAccess.CREATE_USERS );
        assertEquals( params.getUserStorePermissions().getAllPrincipals().getSize(), 1 );

        final EditableUserStore editable = new EditableUserStore( TestDataFixtures.getTestBlankUserStore() );

        editor.edit( editable );
        return editable.build();
    }

    @Test
    public void testModifyUserStoreWithNullValues()
    {
        Mockito.when( securityService.getUserStore( Mockito.any() ) ).thenReturn( TestDataFixtures.getTestUserStore() );
        Mockito.when( securityService.updateUserStore( Mockito.isA( UpdateUserStoreParams.class ) ) ).thenAnswer(
            invocationOnMock -> invokeUpdateWithNullValues( (UpdateUserStoreParams) invocationOnMock.getArguments()[0] ) );

        runFunction( "/com/enonic/xp/app/users/lib/auth/modifyUserStore-test.js", "modifyUserStoreWithNullValues" );
    }

    private UserStore invokeUpdateWithNullValues( final UpdateUserStoreParams params )
    {
        final UserStoreEditor editor = params.getEditor();
        Assert.assertNotNull( editor );

        final EditableUserStore editable = new EditableUserStore( TestDataFixtures.getTestUserStore() );

        editor.edit( editable );
        return editable.build();
    }
}
