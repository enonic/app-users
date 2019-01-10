package com.enonic.xp.app.users.lib.auth;

import com.enonic.xp.security.IdProviderKey;

public class DeleteIdProviderResult
{
    private IdProviderKey idProviderKey;

    private boolean deleted;

    private String reason;

    private DeleteIdProviderResult( final Builder builder )
    {
        idProviderKey = builder.idProviderKey;
        deleted = builder.deleted;
        reason = builder.reason;
    }

    public static Builder create( final IdProviderKey idProviderKey )
    {
        return new Builder( idProviderKey );
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

    public IdProviderKey getIdProviderKey()
    {
        return idProviderKey;
    }

    public static class Builder
    {
        private IdProviderKey idProviderKey;

        private boolean deleted;

        private String reason;

        private Builder()
        {
        }

        private Builder( final IdProviderKey idProviderKey )
        {
            this.idProviderKey = idProviderKey;
        }

        public Builder idProviderKey( final IdProviderKey idProviderKey )
        {
            this.idProviderKey = idProviderKey;
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
