package com.enonic.xp.app.users.publickey;

import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;

public final class GenerateKidHandler
{
    private String publicKey;

    public void setPublicKey( final String publicKey )
    {
        this.publicKey = publicKey;
    }

    public String execute()
    {
        final MessageDigest digest;
        try
        {
            digest = MessageDigest.getInstance( "SHA-512" );
        }
        catch ( final NoSuchAlgorithmException e )
        {
            throw new IllegalStateException( "SHA-512 is unavailable", e );
        }

        final byte[] hash = digest.digest( encoded( this.publicKey ) );

        return HexFormat.of().formatHex( Arrays.copyOfRange( hash, 0, 16 ) );
    }

    private byte[] encoded( final String pem )
    {
        final String body = pem.replace( "-----BEGIN PUBLIC KEY-----", "" )
            .replace( "-----END PUBLIC KEY-----", "" )
            .replaceAll( "\\s+", "" );

        try
        {
            final X509EncodedKeySpec spec = new X509EncodedKeySpec( Base64.getDecoder().decode( body ) );
            KeyFactory.getInstance( "RSA" ).generatePublic( spec );

            return spec.getEncoded();
        }
        catch ( final NoSuchAlgorithmException e )
        {
            throw new IllegalStateException( "RSA is unavailable", e );
        }
        catch ( final Exception e )
        {
            throw new IllegalArgumentException( "Not a readable RSA public key: " + e.getMessage(), e );
        }
    }
}
