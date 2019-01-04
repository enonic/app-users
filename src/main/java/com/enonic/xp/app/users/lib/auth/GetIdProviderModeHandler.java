package com.enonic.xp.app.users.lib.auth;

import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class GetIdProviderModeHandler
    implements ScriptBean
{
    private ApplicationKey applicationKey;

    private Supplier<IdProviderDescriptorService> idProviderDescriptorService;

    public void setApplicationKey( final String applicationKey )
    {
        this.applicationKey = ApplicationKey.from( applicationKey );
    }

    public String getIdProviderMode()
    {
        final IdProviderDescriptor idProviderDescriptor = idProviderDescriptorService.get().getDescriptor( applicationKey );
        return idProviderDescriptor == null ? null : idProviderDescriptor.getMode().toString();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        idProviderDescriptorService = context.getService( IdProviderDescriptorService.class );
    }
}