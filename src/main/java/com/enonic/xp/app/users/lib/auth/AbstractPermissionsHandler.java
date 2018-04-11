package com.enonic.xp.app.users.lib.auth;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.acl.UserStoreAccess;
import com.enonic.xp.security.acl.UserStoreAccessControlEntry;
import com.enonic.xp.security.acl.UserStoreAccessControlList;

public abstract class AbstractPermissionsHandler
    implements ScriptBean
{
    protected Supplier<SecurityService> securityService;

    public List<UserStoreAccessControlEntryMapper> mapUserStorePermissions( final UserStoreAccessControlList userStorePermissions )
    {
        final Principals principals = securityService.get().getPrincipals( userStorePermissions.getAllPrincipals() );
        return principals.stream().
            map( ( principal ) -> new UserStoreAccessControlEntryMapper( principal, getAccess( principal, userStorePermissions ) ) ).
            collect( Collectors.toList() );
    }

    private UserStoreAccess getAccess( final Principal principal, final UserStoreAccessControlList userStoreAccessControlList )
    {
        for ( UserStoreAccessControlEntry entry : userStoreAccessControlList )
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
