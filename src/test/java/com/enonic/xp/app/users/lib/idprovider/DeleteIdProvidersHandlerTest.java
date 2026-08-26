package com.enonic.xp.app.users.lib.idprovider;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.IdProviderNotFoundException;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.testing.ScriptTestSupport;

public class DeleteIdProvidersHandlerTest
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
    public void testDeleteIdProviders()
    {
        final IdProviderKey missing = IdProviderKey.from( "invalid" );

        Mockito.doThrow( new IdProviderNotFoundException( missing ) ).when( securityService ).deleteIdProvider( missing );

        runFunction( "/com/enonic/xp/app/users/lib/idprovider/deleteIdProviders-test.js", "deleteIdProviders" );
    }
}
