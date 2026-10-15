package com.enonic.xp.app.users.lib.idprovider;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public abstract class AbstractIdProviderPermissionsHandler
    implements ScriptBean
{
    protected Supplier<SecurityService> securityService;

    /**
     * The entries as principals, so a caller gets the name to show beside the access level. An entry
     * whose principal no longer exists is dropped: `getPrincipals` answers for what is there.
     */
    protected List<IdProviderPermissionMapper> map( final IdProviderAccessControlList permissions )
    {
        final Principals principals = securityService.get().getPrincipals( permissions.getAllPrincipals() );
        final List<IdProviderPermissionMapper> mapped = new ArrayList<>();

        for ( final Principal principal : principals )
        {
            mapped.add( new IdProviderPermissionMapper( principal, accessOf( principal, permissions ) ) );
        }

        return mapped;
    }

    private IdProviderAccess accessOf( final Principal principal, final IdProviderAccessControlList permissions )
    {
        for ( final IdProviderAccessControlEntry entry : permissions )
        {
            if ( entry.getPrincipal().equals( principal.getKey() ) )
            {
                return entry.getAccess();
            }
        }

        return null;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.securityService = context.getService( SecurityService.class );
    }
}
