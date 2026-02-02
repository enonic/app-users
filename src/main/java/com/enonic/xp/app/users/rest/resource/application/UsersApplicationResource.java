package com.enonic.xp.app.users.rest.resource.application;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import jakarta.annotation.security.RolesAllowed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
import com.enonic.xp.app.users.rest.resource.schema.mixin.CmsFormFragmentServiceResolver;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.jaxrs.JaxRsComponent;
import com.enonic.xp.schema.content.CmsFormFragmentService;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.CmsDescriptor;
import com.enonic.xp.site.CmsService;

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

    private CmsService cmsService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private LocaleService localeService;

    private CmsFormFragmentService cmsFormFragmentService;

    private static final ApplicationImageHelper HELPER = new ApplicationImageHelper();

    public UsersApplicationResource()
    {
    }

    @GET
    @Path("getIdProviderApplications")
    public ListApplicationJson getIdProviderApplications(@Context HttpServletRequest request)
    {
        final ListApplicationJson json = new ListApplicationJson();

        Applications applications = this.applicationService.getInstalledApplications();
        for ( final Application application : applications )
        {
            final ApplicationKey applicationKey = application.getKey();
            final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( applicationKey );

            if ( idProviderDescriptor != null )
            {
                final CmsDescriptor cmsDescriptor = this.cmsService.getDescriptor( applicationKey );
                final boolean localApplication = this.applicationService.isLocalApplication( applicationKey );
                final ApplicationDescriptor appDescriptor = this.applicationDescriptorService.get( applicationKey );
                final List<Locale> locales = Collections.list( request.getLocales() );

                json.add( ApplicationJson.create().
                    setApplication( application ).
                    setLocal( localApplication ).
                    setApplicationDescriptor( appDescriptor ).
                    setCmsDescriptor( cmsDescriptor ).
                    setIdProviderDescriptor( idProviderDescriptor ).
                    setIconUrlResolver( new ApplicationIconUrlResolver( request ) ).
                    setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, applicationKey, locales ) ).
                    setCmsFormFragmentServiceResolver( new CmsFormFragmentServiceResolver( this.cmsFormFragmentService ) ).
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
    public void setCmsService( final CmsService cmsService )
    {
        this.cmsService = cmsService;
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
    public void setCmsFormFragmentService( final CmsFormFragmentService cmsFormFragmentService )
    {
        this.cmsFormFragmentService = cmsFormFragmentService;
    }
}

