package com.enonic.xp.app.users.serviceaccount;

import java.util.function.Supplier;

import com.enonic.xp.app.users.lib.auth.PrincipalMapper;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.CreateUserParams;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.UpdateUserParams;
import com.enonic.xp.security.User;

public class CreateServiceAccountHandler
    implements ScriptBean
{
    private Supplier<SecurityService> securityServiceSupplier;

    private PrincipalKey key;

    private String displayName;

    private String kid;

    private String publicKey;

    public void setKey( final String key )
    {
        this.key = PrincipalKey.from( key );
    }

    public void setDisplayName( final String displayName )
    {
        this.displayName = displayName;
    }

    public void setKid( final String kid )
    {
        this.kid = kid;
    }

    public void setPublicKey( final String publicKey )
    {
        this.publicKey = publicKey;
    }

    public PrincipalMapper execute()
    {
        User serviceAccount = securityServiceSupplier.get().createUser(
            CreateUserParams.create().userKey( key ).displayName( displayName ).login( key.getId() ).email(
                key.getId() + "@iam.eserviceaccount.enonic.com" ).build() );

        User updatedServiceAccount = securityServiceSupplier.get().updateUser(
            UpdateUserParams.create().userKey( serviceAccount.getKey() ).email( serviceAccount.getEmail() ).editor( editableUser -> {
                editableUser.profile.addString( "kid", kid );
                editableUser.profile.addString( "publicKey", publicKey );
            } ).build() );

        return new PrincipalMapper( updatedServiceAccount, true );
    }

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.securityServiceSupplier = beanContext.getService( SecurityService.class );
    }
}
