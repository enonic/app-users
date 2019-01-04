package com.enonic.xp.app.users.lib.auth;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.security.Group;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.User;
import com.enonic.xp.security.UserStore;
import com.enonic.xp.security.UserStoreKey;

public class TestDataFixtures
{
    private static final Instant NOW = Instant.ofEpochSecond( 0 );

    private static Clock clock = Clock.fixed( NOW, ZoneId.of( "UTC" ) );

    public static User getTestUser()
    {
        return User.create().
            key( PrincipalKey.ofUser( UserStoreKey.from( "enonic" ), "user1" ) ).
            displayName( "User 1" ).
            modifiedTime( Instant.now( clock ) ).
            email( "user1@enonic.com" ).
            login( "user1" ).
            profile( getProfile() ).
            build();
    }

    private static PropertyTree getProfile()
    {
        final PropertySet appPropertySet = new PropertySet();
        appPropertySet.setString( "subString", "subStringValue" );
        appPropertySet.setLong( "subLong", 123l );

        final PropertyTree profile = new PropertyTree();
        profile.setSet( "myApp", appPropertySet );
        profile.setString( "string", "stringValue" );

        return profile;
    }

    public static Group getTestGroup()
    {
        return Group.create().
            key( PrincipalKey.ofGroup( UserStoreKey.system(), "group-a" ) ).
            displayName( "Group A" ).
            modifiedTime( Instant.now( clock ) ).
            description( "description" ).
            build();
    }

    public static UserStore getTestBlankUserStore()
    {
        return UserStore.create().
            key( UserStoreKey.from( "myUserStore" ) ).
            displayName( "" ).
            description( "" ).
            build();
    }

    public static UserStore getTestUserStore()
    {
        return UserStore.create().
            key( UserStoreKey.from( "myUserStore" ) ).
            displayName( "User store test" ).
            description( "User store used for testing" ).
            idProviderConfig( getTestIdProviderConfig() ).
            build();
    }

    private static IdProviderConfig getTestIdProviderConfig()
    {
        return IdProviderConfig.create().
            applicationKey( ApplicationKey.from( "com.enonic.app.test" ) ).
            config( getConfig() ).
            build();
    }

    private static PropertyTree getConfig()
    {
        final PropertySet passwordPropertySet = new PropertySet();
        passwordPropertySet.setString( "email", "noreply@example.com" );
        passwordPropertySet.setString( "site", "MyWebsite" );

        final PropertySet emptyPropertySet = new PropertySet();

        final PropertyTree config = new PropertyTree();
        config.setString( "title", "App Title" );
        config.setBoolean( "avatar", true );
        config.setLong( "sessionTimeout", null );
        config.setSet( "forgotPassword", passwordPropertySet );
        config.setSet( "emptySet", null );
        config.setReference( "defaultGroups", null );

        return config;
    }
}
