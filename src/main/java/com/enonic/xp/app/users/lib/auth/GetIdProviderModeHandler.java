package com.enonic.xp.app.users.lib.auth;

import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.auth.AuthDescriptor;
import com.enonic.xp.auth.AuthDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.UserStore;

public final class GetIdProviderModeHandler
    implements ScriptBean
{
    private ApplicationKey applicationKey;

    private Supplier<AuthDescriptorService> authDescriptorService;

    public void setApplicationKey( final String applicationKey )
    {
        this.applicationKey = ApplicationKey.from( applicationKey );
    }

    public String getIdProviderMode()
    {
        final AuthDescriptor authDescriptor = authDescriptorService.get().getDescriptor( applicationKey );
        return authDescriptor == null ? null : authDescriptor.getMode().toString();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        authDescriptorService = context.getService( AuthDescriptorService.class );
    }
}