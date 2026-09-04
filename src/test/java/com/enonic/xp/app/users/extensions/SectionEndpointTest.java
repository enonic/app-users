package com.enonic.xp.app.users.extensions;

import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.node.NodeService;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.repository.RepositoryService;
import com.enonic.xp.security.SecurityService;
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
     * <p>
     * The three below are what loading the controller at all costs: lib-node and lib-repo bind their
     * script beans inside `require`, so with any of them missing every test here fails on the import,
     * not on what it asserts.
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

        addService( NodeService.class, Mockito.mock( NodeService.class ) );
        addService( SecurityService.class, Mockito.mock( SecurityService.class ) );
        addService( RepositoryService.class, Mockito.mock( RepositoryService.class ) );
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

    @Test
    public void testRefusesAPermissionReportWithoutTheAdminRole()
    {
        runFunction( TEST_SCRIPT, "refusesAPermissionReportWithoutTheAdminRole" );
    }
}
