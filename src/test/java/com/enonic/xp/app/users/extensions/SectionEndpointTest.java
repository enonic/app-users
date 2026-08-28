package com.enonic.xp.app.users.extensions;

import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.testing.ScriptTestSupport;

/**
 * The shared controller behind all four section descriptors, on the engine XP runs it on: the unit
 * tests beside it use doubles for lib-io and lib-graphql, so nothing there proves the schema builds
 * on graphql-java or that a resource is readable off the classpath.
 */
public class SectionEndpointTest
    extends ScriptTestSupport
{
    private static final String TEST_SCRIPT = "/com/enonic/xp/app/users/extensions/section-endpoint-test.js";

    /**
     * ScriptTestSupport registers no LocaleService, so `phrases` would fail to fetch without one —
     * nor a PortalUrlService, which the `config` resolver needs for `eventsUrl`.
     */
    @Override
    public void initialize()
        throws Exception
    {
        super.initialize();

        final MessageBundle bundle = Mockito.mock( MessageBundle.class );
        Mockito.when( bundle.asMap() ).thenReturn( Map.of( "section.users.title", "Brukere" ) );

        final LocaleService localeService = Mockito.mock( LocaleService.class );
        Mockito.when( localeService.getSupportedLocale( Mockito.anyList(), Mockito.any(), Mockito.<String>any() ) )
            .thenReturn( Locale.of( "no" ) );
        Mockito.when( localeService.getBundle( Mockito.any(), Mockito.any(), Mockito.<String>any() ) ).thenReturn( bundle );

        addService( LocaleService.class, localeService );

        final PortalUrlService portalUrlService = Mockito.mock( PortalUrlService.class );
        Mockito.when( portalUrlService.apiUrl( Mockito.any() ) )
            .thenReturn( "/admin/com.enonic.xp.app.settings/main/_/admin:events" );

        addService( PortalUrlService.class, portalUrlService );
    }

    @Test
    public void testServesStaticAsText()
    {
        runFunction( TEST_SCRIPT, "servesStaticAsText" );
    }

    @Test
    public void testAnswers404ForAbsentStatic()
    {
        runFunction( TEST_SCRIPT, "answers404ForAbsentStatic" );
    }

    @Test
    public void testBuildsTheSchemaAndAnswersConfig()
    {
        runFunction( TEST_SCRIPT, "buildsTheSchemaAndAnswersConfig" );
    }

    @Test
    public void testAnswersPhrasesAsAReadableJsonMap()
    {
        runFunction( TEST_SCRIPT, "answersPhrasesAsAReadableJsonMap" );
    }

    @Test
    public void testExposesThePrincipalsSchema()
    {
        runFunction( TEST_SCRIPT, "exposesThePrincipalsSchema" );
    }

    @Test
    public void testReportsAnUnknownFieldAsAGraphQlError()
    {
        runFunction( TEST_SCRIPT, "reportsAnUnknownFieldAsAGraphQlError" );
    }

    @Test
    public void testRejectsABodyThatIsNotAQuery()
    {
        runFunction( TEST_SCRIPT, "rejectsABodyThatIsNotAQuery" );
    }
}
