package com.enonic.xp.app.users.handler;

import java.security.MessageDigest;
import java.security.spec.X509EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.Objects;

import com.enonic.xp.util.HexEncoder;

public class KidVerifierHandler
{
    public boolean verify( final String kid, final String publicKey )
    {
        Objects.requireNonNull( kid, "KID cannot be null" );
        Objects.requireNonNull( publicKey, "PublicKey cannot be null" );
        try
        {
            MessageDigest messageDigest = MessageDigest.getInstance( "SHA-512" );
            byte[] publicKeyHash = messageDigest.digest( getEncodedPublicKey( publicKey ) );
            byte[] truncatedHash = Arrays.copyOfRange( publicKeyHash, 0, 16 );
            String generatedKid = HexEncoder.toHex( truncatedHash );
            return Objects.equals( kid, generatedKid );
        }
        catch ( Exception e )
        {
            throw new IllegalStateException( e );
        }
    }

    private byte[] getEncodedPublicKey( final String publicKey) {
        String truncatedPublicKey = publicKey
            .replace( "-----BEGIN RSA PUBLIC KEY-----", "" )
            .replace( "-----END RSA PUBLIC KEY-----", "" )
            .replaceAll("[\\t\\n\\r]+", "" );

        X509EncodedKeySpec ks = new X509EncodedKeySpec( Base64.getDecoder().decode( truncatedPublicKey ) );
        return ks.getEncoded();
    }
}
