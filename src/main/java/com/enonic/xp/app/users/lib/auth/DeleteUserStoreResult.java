package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.UserStoreKey;

public class DeleteUserStoreResult
{
    private UserStoreKey userStoreKey;

    private boolean deleted;

    private String reason;

    private DeleteUserStoreResult( final Builder builder )
    {
        userStoreKey = builder.userStoreKey;
        deleted = builder.deleted;
        reason = builder.reason;
    }

    public UserStoreKey getUserStoreKey()
    {
        return userStoreKey;
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

    public static Builder create( final UserStoreKey userStoreKey )
    {
        return new Builder( userStoreKey );
    }

    public static class Builder
    {
        private UserStoreKey userStoreKey;

        private boolean deleted;

        private String reason;

        private Builder()
        {
        }

        private Builder( final UserStoreKey userStoreKey )
        {
            this.userStoreKey = userStoreKey;
        }

        public Builder userStoreKey( final UserStoreKey userStoreKey )
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

        public DeleteUserStoreResult build()
        {
            return new DeleteUserStoreResult( this );
        }
    }
}
