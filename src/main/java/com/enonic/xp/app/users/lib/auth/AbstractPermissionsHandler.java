package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.IdProviderAccess;
import com.enonic.xp.security.acl.IdProviderAccessControlEntry;
import com.enonic.xp.security.acl.IdProviderAccessControlList;

public abstract class AbstractPermissionsHandler
    implements ScriptBean
{
    protected Supplier<SecurityService> securityService;

    public List<IdProviderAccessControlEntryMapper> mapIdProviderPermissions( final IdProviderAccessControlList idProviderPermissions )
    {
        final Principals principals = securityService.get().getPrincipals( idProviderPermissions.getAllPrincipals() );
        return principals.stream().
            map( ( principal ) -> new IdProviderAccessControlEntryMapper( principal, getAccess( principal, idProviderPermissions ) ) ).
            collect( Collectors.toList() );
    }

    private IdProviderAccess getAccess( final Principal principal, final IdProviderAccessControlList idProviderAccessControlList )
    {
        for ( IdProviderAccessControlEntry entry : idProviderAccessControlList )
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
