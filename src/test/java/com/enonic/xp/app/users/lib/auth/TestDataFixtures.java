package com.enonic.xp.app.users.lib.auth;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.security.Group;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.User;

public class TestDataFixtures
{
    private static final Instant NOW = Instant.ofEpochSecond( 0 );

    private static final Clock clock = Clock.fixed( NOW, ZoneId.of( "UTC" ) );

    public static User getTestUser()
    {
        return User.create().key( PrincipalKey.ofUser( IdProviderKey.from( "enonic" ), "user1" ) ).displayName( "User 1" ).modifiedTime(
            Instant.now( clock ) ).email( "user1@enonic.com" ).login( "user1" ).profile( getProfile() ).build();
    }

    private static PropertyTree getProfile()
    {
        final PropertyTree profile = new PropertyTree();

        final PropertySet appPropertySet = profile.newSet();
        appPropertySet.setString( "subString", "subStringValue" );
        appPropertySet.setLong( "subLong", 123L );

        profile.setSet( "myApp", appPropertySet );
        profile.setString( "string", "stringValue" );

        return profile;
    }

    public static Group getTestGroup()
    {
        return Group.create().key( PrincipalKey.ofGroup( IdProviderKey.system(), "group-a" ) ).displayName( "Group A" ).modifiedTime(
            Instant.now( clock ) ).description( "description" ).build();
    }

    public static IdProvider getTestBlankIdProvider()
    {
        return IdProvider.create().key( IdProviderKey.from( "myIdProvider" ) ).displayName( "" ).description( "" ).build();
    }

    public static IdProvider getTestIdProvider()
    {
        return IdProvider.create().key( IdProviderKey.from( "myIdProvider" ) ).displayName( "Id provider test" ).description(
            "Id provider used for testing" ).idProviderConfig( getTestIdProviderConfig() ).build();
    }

    private static IdProviderConfig getTestIdProviderConfig()
    {
        return IdProviderConfig.create().applicationKey( ApplicationKey.from( "com.enonic.app.test" ) ).config( getConfig() ).build();
    }

    private static PropertyTree getConfig()
    {
        final PropertyTree config = new PropertyTree();

        final PropertySet passwordPropertySet = config.newSet();
        passwordPropertySet.setString( "email", "noreply@example.com" );
        passwordPropertySet.setString( "site", "MyWebsite" );

        config.setString( "title", "App Title" );
        config.setBoolean( "avatar", true );
        config.setLong( "sessionTimeout", null );
        config.setSet( "forgotPassword", passwordPropertySet );
        config.setSet( "emptySet", null );
        config.setReference( "defaultGroups", null );

        return config;
    }
}
