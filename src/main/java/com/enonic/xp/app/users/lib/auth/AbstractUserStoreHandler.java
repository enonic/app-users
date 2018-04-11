package com.enonic.xp.app.users.lib.auth;

import java.util.function.Supplier;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;

public abstract class AbstractUserStoreHandler
    implements ScriptBean
{
    protected Supplier<SecurityService> securityService;

    protected boolean isPrincipalExists( final PrincipalKey principalKey )
    {
        return securityService.get().getPrincipal( principalKey ).isPresent();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.securityService = context.getService( SecurityService.class );
    }
}
