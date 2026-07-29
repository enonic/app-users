package com.enonic.xp.app.users.apis.graphql;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class UtilsTest
    extends ScriptTestSupport
{
    @Test
    public void toIntFromNumber()
    {
        runFunction( "/com/enonic/xp/app/users/apis/graphql/utils-test.js", "toIntFromNumber" );
    }

    @Test
    public void toIntFromString()
    {
        runFunction( "/com/enonic/xp/app/users/apis/graphql/utils-test.js", "toIntFromString" );
    }

    @Test
    public void toIntNullReturnsDefault()
    {
        runFunction( "/com/enonic/xp/app/users/apis/graphql/utils-test.js", "toIntNullReturnsDefault" );
    }
}
