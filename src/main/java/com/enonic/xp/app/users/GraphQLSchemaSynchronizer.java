package com.enonic.xp.app.users;

import com.enonic.xp.script.ScriptValue;

public class GraphQLSchemaSynchronizer
{
    public static synchronized void sync( final ScriptValue callbackScriptValue )
    {
        callbackScriptValue.call();
    }
}