package com.enonic.xp.app.users.rest.resource.schema.content;

import java.util.Collections;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.web.servlet.ServletRequestHolder;

public final class LocaleMessageResolver
{
    private static final Logger LOG = LoggerFactory.getLogger( LocaleMessageResolver.class );

    private final LocaleService localeService;

    private ApplicationKey applicationKey;

    public LocaleMessageResolver( final LocaleService localeService )
    {
        this.localeService = localeService;
    }

    public LocaleMessageResolver( final LocaleService localeService, final ApplicationKey applicationKey )
    {
        this( localeService );
        this.applicationKey = applicationKey;
    }

    public String localizeMessage( final String key, final String defaultValue )
    {
        final MessageBundle bundle = this.localeService.getBundle( applicationKey, getLocale() );

        if ( bundle == null )
        {
            return defaultValue;
        }
        final String localizedValue;
        try
        {
            localizedValue = bundle.localize( key );
        }
        catch ( IllegalArgumentException e )
        {
            LOG.error( "Error on localization of message with key [{}].", key, e );
            return bundle.getMessage( key );
        }

        return localizedValue != null ? localizedValue : defaultValue;
    }

    private Locale getLocale()
    {
        final HttpServletRequest req = ServletRequestHolder.getRequest();
        if ( req == null )
        {
            return null;
        }

        return localeService.getSupportedLocale( Collections.list( req.getLocales() ), applicationKey );
    }
}
