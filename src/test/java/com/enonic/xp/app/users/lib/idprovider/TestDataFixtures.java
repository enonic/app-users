package com.enonic.xp.app.users.lib.idprovider;

import java.time.Instant;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.security.Group;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderConfig;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.User;

/**
 * The fixtures the `*-test.js` files are written against, kept as app-users has them.
 *
 * The config is the interesting part: a string, a boolean, a null `Long`, a nested set, a null set and a
 * null `Reference` are six shapes the codec has to survive, and the golden JSON pins what each becomes.
 */
public final class TestDataFixtures
{
    private static final Instant EPOCH = Instant.ofEpochSecond( 0 );

    private TestDataFixtures()
    {
    }

    public static User testUser()
    {
        return User.create()
            .key( PrincipalKey.ofUser( IdProviderKey.from( "myIdProvider" ), "user" ) )
            .displayName( "User 1" )
            .modifiedTime( EPOCH )
            .email( "user1@enonic.com" )
            .login( "user1" )
            .build();
    }

    public static Group testGroup()
    {
        return Group.create()
            .key( PrincipalKey.ofGroup( IdProviderKey.from( "myIdProvider" ), "group" ) )
            .displayName( "Group A" )
            .modifiedTime( EPOCH )
            .description( "description" )
            .build();
    }

    public static IdProvider testIdProvider()
    {
        return IdProvider.create()
            .key( IdProviderKey.from( "myIdProvider" ) )
            .displayName( "Id provider test" )
            .description( "Id provider used for testing" )
            .idProviderConfig( testIdProviderConfig() )
            .build();
    }

    public static IdProvider blankIdProvider()
    {
        return IdProvider.create().key( IdProviderKey.from( "myIdProvider" ) ).displayName( "" ).description( "" ).build();
    }

    private static IdProviderConfig testIdProviderConfig()
    {
        return IdProviderConfig.create()
            .applicationKey( ApplicationKey.from( "com.enonic.app.test" ) )
            .config( testConfig() )
            .build();
    }

    private static PropertyTree testConfig()
    {
        final PropertyTree config = new PropertyTree();

        final PropertySet forgotPassword = config.newSet();
        forgotPassword.setString( "email", "noreply@example.com" );
        forgotPassword.setString( "site", "MyWebsite" );

        config.setString( "title", "App Title" );
        config.setBoolean( "avatar", true );
        config.setLong( "sessionTimeout", null );
        config.setSet( "forgotPassword", forgotPassword );
        config.setSet( "emptySet", null );
        config.setReference( "defaultGroups", null );

        return config;
    }
}
