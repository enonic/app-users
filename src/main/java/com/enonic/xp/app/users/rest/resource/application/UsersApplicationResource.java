package com.enonic.xp.app.users.rest.resource.application;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.app.Applications;
import com.enonic.xp.app.users.rest.resource.ResourceConstants;
import com.enonic.xp.app.users.rest.resource.application.json.ApplicationJson;
import com.enonic.xp.app.users.rest.resource.application.json.ListApplicationJson;
import com.enonic.xp.app.users.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.users.rest.resource.schema.mixin.InlineMixinResolver;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.jaxrs.JaxRsComponent;
import com.enonic.xp.schema.mixin.MixinService;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.SiteDescriptor;
import com.enonic.xp.site.SiteService;

import static com.google.common.base.Strings.isNullOrEmpty;

@Path(ResourceConstants.REST_ROOT + "application")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({RoleKeys.ADMIN_LOGIN_ID, RoleKeys.ADMIN_ID})
@Component(immediate = true, property = "group=v2users")
public final class UsersApplicationResource
    implements JaxRsComponent
{
    private ApplicationService applicationService;

    private ApplicationDescriptorService applicationDescriptorService;

    private SiteService siteService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private LocaleService localeService;

    private MixinService mixinService;

    private final ApplicationIconUrlResolver iconUrlResolver;

    private static final ApplicationImageHelper HELPER = new ApplicationImageHelper();

    public UsersApplicationResource()
    {
        iconUrlResolver = new ApplicationIconUrlResolver();
    }

    @GET
    @Path("getIdProviderApplications")
    public ListApplicationJson getIdProviderApplications()
    {
        final ListApplicationJson json = new ListApplicationJson();

        Applications applications = this.applicationService.getInstalledApplications();
        for ( final Application application : applications )
        {
            final ApplicationKey applicationKey = application.getKey();
            final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( applicationKey );

            if ( idProviderDescriptor != null )
            {
                final SiteDescriptor siteDescriptor = this.siteService.getDescriptor( applicationKey );
                final boolean localApplication = this.applicationService.isLocalApplication( applicationKey );
                final ApplicationDescriptor appDescriptor = this.applicationDescriptorService.get( applicationKey );

                json.add( ApplicationJson.create().
                    setApplication( application ).
                    setLocal( localApplication ).
                    setApplicationDescriptor( appDescriptor ).
                    setSiteDescriptor( siteDescriptor ).
                    setIdProviderDescriptor( idProviderDescriptor ).
                    setIconUrlResolver( this.iconUrlResolver ).
                    setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, applicationKey ) ).
                    setInlineMixinResolver( new InlineMixinResolver( this.mixinService ) ).
                    build() );
            }
        }

        return json;
    }

    @GET
    @Path("icon/{appKey}")
    @Produces("image/*")
    public Response getIcon( @PathParam("appKey") final String appKeyStr, @QueryParam("hash") final String hash )
        throws Exception
    {
        final ApplicationKey appKey = ApplicationKey.from( appKeyStr );
        final ApplicationDescriptor appDescriptor = applicationDescriptorService.get( appKey );
        final Icon icon = appDescriptor == null ? null : appDescriptor.getIcon();

        final Response.ResponseBuilder responseBuilder;
        if ( icon == null )
        {
            final Icon defaultAppIcon = HELPER.getDefaultApplicationIcon();
            responseBuilder = Response.ok( defaultAppIcon.asInputStream(), defaultAppIcon.getMimeType() );
            applyMaxAge( Integer.MAX_VALUE, responseBuilder );
        }
        else
        {
            responseBuilder = Response.ok( icon.toByteArray(), icon.getMimeType() );
            if ( !isNullOrEmpty( hash ) )
            {
                applyMaxAge( Integer.MAX_VALUE, responseBuilder );
            }
        }

        return responseBuilder.build();
    }

    private void applyMaxAge( int maxAge, final Response.ResponseBuilder responseBuilder )
    {
        final CacheControl cacheControl = new CacheControl();
        cacheControl.setMaxAge( maxAge );
        responseBuilder.cacheControl( cacheControl );
    }

    @Reference
    public void setApplicationService( final ApplicationService applicationService )
    {
        this.applicationService = applicationService;
    }

    @Reference
    public void setApplicationDescriptorService( final ApplicationDescriptorService applicationDescriptorService )
    {
        this.applicationDescriptorService = applicationDescriptorService;
    }

    @Reference
    public void setSiteService( final SiteService siteService )
    {
        this.siteService = siteService;
    }

    @Reference
    public void setIdProviderDescriptorService( final IdProviderDescriptorService idProviderDescriptorService )
    {
        this.idProviderDescriptorService = idProviderDescriptorService;
    }

    @Reference
    public void setLocaleService( final LocaleService localeService )
    {
        this.localeService = localeService;
    }

    @Reference
    public void setMixinService( final MixinService mixinService )
    {
        this.mixinService = mixinService;
    }
}

