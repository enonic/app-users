package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.IdProviderKey;

public class DeleteIdProviderResult
{
    private IdProviderKey userStoreKey;

    private boolean deleted;

    private String reason;

    private DeleteIdProviderResult( final Builder builder )
    {
        userStoreKey = builder.userStoreKey;
        deleted = builder.deleted;
        reason = builder.reason;
    }

    public static Builder create( final IdProviderKey userStoreKey )
    {
        return new Builder( userStoreKey );
    }

    public boolean isDeleted()
    {
        return deleted;
    }

    public String getReason()
    {
        return reason;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public IdProviderKey getUserStoreKey()
    {
        return userStoreKey;
    }

    public static class Builder
    {
        private IdProviderKey userStoreKey;

        private boolean deleted;

        private String reason;

        private Builder()
        {
        }

        private Builder( final IdProviderKey userStoreKey )
        {
            this.userStoreKey = userStoreKey;
        }

        public Builder userStoreKey( final IdProviderKey userStoreKey )
        {
            this.userStoreKey = userStoreKey;
            return this;
        }

        public Builder deleted( final boolean deleted )
        {
            this.deleted = deleted;
            return this;
        }

        public Builder reason( final String reason )
        {
            this.reason = reason;
            return this;
        }

        public DeleteIdProviderResult build()
        {
            return new DeleteIdProviderResult( this );
        }
    }
}
