package com.enonic.xp.app.users.lib.icon;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.testing.ScriptTestSupport;

public class EncodeApplicationIconHandlerTest
    extends ScriptTestSupport
{
    private static final String SCRIPT = "/com/enonic/xp/app/users/lib/icon/encodeApplicationIcon-test.js";

    private static final ApplicationKey APP = ApplicationKey.from( "com.enonic.app.oidc" );

    private ApplicationDescriptorService descriptorService;

    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();
        this.descriptorService = Mockito.mock( ApplicationDescriptorService.class );
        addService( ApplicationDescriptorService.class, this.descriptorService );
    }

    @Test
    public void testIcon()
    {
        final Icon icon = Icon.from( "<svg/>".getBytes( StandardCharsets.UTF_8 ), "image/svg+xml", Instant.EPOCH );
        Mockito.when( descriptorService.get( APP ) ).thenReturn( ApplicationDescriptor.create().key( APP ).icon( icon ).build() );

        runFunction( SCRIPT, "encodeIcon" );
    }

    @Test
    public void testNoIcon()
    {
        Mockito.when( descriptorService.get( APP ) ).thenReturn( ApplicationDescriptor.create().key( APP ).build() );

        runFunction( SCRIPT, "encodeNoIcon" );
    }

    @Test
    public void testNoDescriptor()
    {
        runFunction( SCRIPT, "encodeNoIcon" );
    }
}
