package com.enonic.xp.app.users.rest.resource.security;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import jakarta.ws.rs.WebApplicationException;

import com.enonic.xp.app.users.rest.resource.AdminResourceTestSupport;
import com.enonic.xp.jaxrs.impl.MockRestResponse;
import com.enonic.xp.security.Group;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.PrincipalQuery;
import com.enonic.xp.security.PrincipalQueryResult;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.Role;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.web.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class UsersSecurityResourceTest
    extends AdminResourceTestSupport
{
    private static final Instant NOW = Instant.ofEpochSecond( 0 );

    private static final Clock clock = Clock.fixed( NOW, ZoneId.of( "UTC" ) );

    private static final IdProviderKey ID_PROVIDER_1 = IdProviderKey.from( "local" );

    private static final IdProviderKey ID_PROVIDER_2 = IdProviderKey.from( "file-store" );

    private SecurityService securityService;

    @Override
    protected UsersSecurityResource getResourceInstance()
    {
        securityService = Mockito.mock( SecurityService.class );

        final UsersSecurityResource resource = new UsersSecurityResource();

        resource.setSecurityService( securityService );

        return resource;
    }

    @Test
    public void findPrincipals()
        throws Exception
    {
        final ArgumentCaptor<PrincipalQuery> queryCaptor = ArgumentCaptor.forClass( PrincipalQuery.class );

        final PrincipalQueryResult principalQueryResult = PrincipalQueryResult.create().
            addPrincipal( User.anonymous() ).
            addPrincipal( Role.create().key( RoleKeys.EVERYONE ).displayName( "everyone" ).build() ).
            build();

        Mockito.when( securityService.query( Mockito.isA( PrincipalQuery.class ) ) ).thenReturn( principalQueryResult );

        String result = request().
            path( "security/principals" ).
            queryParam( "types", "user,role" ).
            queryParam( "query", "query" ).
            queryParam( "idProviderKey", "enonic" ).
            queryParam( "from", "0" ).
            queryParam( "size", "10" ).
            get().getAsString();

        Mockito.verify( securityService, Mockito.times( 1 ) ).query( queryCaptor.capture() );

        assertEquals( "query", queryCaptor.getValue().getSearchText() );
        assertEquals( 2, queryCaptor.getValue().getPrincipalTypes().size() );
        assertEquals( 0, queryCaptor.getValue().getFrom() );
        assertEquals( 10, queryCaptor.getValue().getSize() );

        assertJson( "findPrincipalsResult.json", result );
    }

    @Test
    public void findPrincipalsWrongPrincipalType()
        throws Exception
    {
        MockRestResponse result = request().
            path( "security/principals" ).
            queryParam( "types", "wrongType" ).
            get();

        assertEquals( HttpStatus.INTERNAL_SERVER_ERROR.value(), result.getStatus() );
    }

    @Test
    public void getUsersFromPrincipals()
        throws Exception
    {
        final Principals principals = createPrincipalsFromUsers();
        assertIterableEquals( principals.getList(), principals.getUsers() );
    }

    @Test
    public void getRolesFromPrincipals()
        throws Exception
    {
        final Principals principals = createPrincipalsFromRoles();
        assertIterableEquals( principals.getList(), principals.getRoles() );
    }

    @Test
    public void getGroupsFromPrincipals()
        throws Exception
    {
        final Principals principals = createPrincipalsFromGroups();
        assertIterableEquals( principals.getList(), principals.getGroups() );
    }

    @Test
    public void isEmailAvailableNegative()
        throws Exception
    {
        final User user = User.create().
            key( PrincipalKey.ofUser( ID_PROVIDER_1, "a" ) ).
            displayName( "Alice" ).
            modifiedTime( Instant.now( clock ) ).
            email( "alice@enonic.com" ).
            login( "alice" ).
            build();

        final PrincipalQueryResult queryResult = PrincipalQueryResult.create().addPrincipal( user ).totalSize( 1 ).build();
        Mockito.when( securityService.query( Mockito.any( PrincipalQuery.class ) ) ).thenReturn( queryResult );

        String jsonString = request().
            path( "security/principals/emailAvailable" ).
            queryParam( "email", "true" ).
            queryParam( "idProviderKey", "true" ).
            get().getAsString();

        assertJson( "emailNotAvailableSuccess.json", jsonString );
    }

    @Test
    public void isEmailAvailablePositive()
        throws Exception
    {
        final PrincipalQueryResult queryResult = PrincipalQueryResult.create().totalSize( 0 ).build();
        Mockito.when( securityService.query( Mockito.any( PrincipalQuery.class ) ) ).thenReturn( queryResult );

        String jsonString = request().
            path( "security/principals/emailAvailable" ).
            queryParam( "email", "true" ).
            queryParam( "idProviderKey", "true" ).
            get().getAsString();

        assertJson( "emailAvailableSuccess.json", jsonString );
    }

    @Test
    public void isEmailAvailableEmpty()
    {
        UsersSecurityResource resource = getResourceInstance();

        final WebApplicationException ex = assertThrows( WebApplicationException.class, () -> {
            resource.isEmailAvailable( "idProviderKey", "" );
        } );
        assertEquals( "Expected email parameter", ex.getMessage() );
    }

    private Principals createPrincipalsFromUsers()
    {
        final User user1 = User.create().
            key( PrincipalKey.ofUser( ID_PROVIDER_1, "a" ) ).
            displayName( "Alice" ).
            modifiedTime( Instant.now( clock ) ).
            email( "alice@a.org" ).
            login( "alice" ).
            build();

        final User user2 = User.create().
            key( PrincipalKey.ofUser( ID_PROVIDER_2, "b" ) ).
            displayName( "Bobby" ).
            modifiedTime( Instant.now( clock ) ).
            email( "bobby@b.org" ).
            login( "bobby" ).
            build();
        return Principals.from( user1, user2 );
    }

    private Principals createPrincipalsFromRoles()
    {
        final Role role1 = Role.create().
            key( PrincipalKey.ofRole( "a" ) ).
            displayName( "Destructors" ).
            modifiedTime( Instant.now( clock ) ).
            build();

        final Role role2 = Role.create().
            key( PrincipalKey.ofRole( "b" ) ).
            displayName( "Overlords" ).
            modifiedTime( Instant.now( clock ) ).
            build();
        return Principals.from( role1, role2 );
    }

    private Principals createPrincipalsFromGroups()
    {
        final Group group1 = Group.create().
            key( PrincipalKey.ofGroup( ID_PROVIDER_1, "a" ) ).
            displayName( "Destructors" ).
            modifiedTime( Instant.now( clock ) ).
            build();

        final Group group2 = Group.create().
            key( PrincipalKey.ofGroup( ID_PROVIDER_2, "b" ) ).
            displayName( "Overlords" ).
            modifiedTime( Instant.now( clock ) ).
            build();
        return Principals.from( group1, group2 );
    }
}
