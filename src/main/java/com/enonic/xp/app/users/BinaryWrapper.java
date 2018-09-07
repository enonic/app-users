package com.enonic.xp.app.users;

import java.io.File;

import com.google.common.io.Files;

import com.enonic.xp.node.BinaryAttachment;
import com.enonic.xp.util.BinaryReference;

public final class BinaryWrapper
{
    public static BinaryAttachment wrap( final String path )
    {
        final File file = new File( path );
        return new BinaryAttachment( BinaryReference.from( "report" ), Files.asByteSource( file ) );
    }
}
