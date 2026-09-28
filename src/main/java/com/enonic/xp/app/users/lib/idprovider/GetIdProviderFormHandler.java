package com.enonic.xp.app.users.lib.idprovider;

import java.util.List;
import java.util.Locale;
import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class GetIdProviderFormHandler
    implements ScriptBean
{
    private String application;

    private String locale;

    private Supplier<IdProviderDescriptorService> idProviderDescriptorServiceSupplier;

    private Supplier<LocaleService> localeServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public void setLocale( final String locale )
    {
        this.locale = locale;
    }

    public IdProviderFormMapper execute()
    {
        final ApplicationKey key = ApplicationKey.from( application );
        final IdProviderDescriptor descriptor = idProviderDescriptorServiceSupplier.get().getDescriptor( key );

        if ( descriptor == null )
        {
            return null;
        }

        final LocaleService localeService = localeServiceSupplier.get();
        final Locale supported =
            locale == null ? null : localeService.getSupportedLocale( List.of( Locale.forLanguageTag( locale ) ), key );

        return new IdProviderFormMapper( descriptor.getConfig(), localeService.getBundle( key, supported ) );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.idProviderDescriptorServiceSupplier = context.getService( IdProviderDescriptorService.class );
        this.localeServiceSupplier = context.getService( LocaleService.class );
    }
}
