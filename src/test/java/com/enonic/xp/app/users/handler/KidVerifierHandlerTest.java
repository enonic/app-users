package com.enonic.xp.app.users.handler;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class KidVerifierHandlerTest
{
    @Test
    public void testVerify()
    {
        String kid = "f970ced1673f0a2790b526ad03625e38";
        String key =
            "-----BEGIN RSA PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApNwdk1aW66Bl6eBl7AUc2NeHj+3sUUpX02CgA0vmJaE5wbf/atlFMD0yw+YThez8lcYKRL3QXGJ+qa9wFvVPDx6K8+99PutYD3rHS0Nrxeu4f/X5QTn7vU8/vCYGuzup7QF0jIYB8BP9/Z4gVBIpNTWh35b0IZlQCbBHPd8cRMQ9JpKfFpYhWKJ9rzmmUDhcdXRuMPmF6JwDhhiABlKaAmEan7x/BakMOY+A9p6KpKgrZdocosxJrXs0yEkTLv4U6cWSntd6y/tuj/QanMZXBFNUo5JwlnQ63u0gJSob6MXI5Oi0wkC5VOsdFgeJH49rkn6s4F17N82CO37hWy62rwIDAQAB\n-----END RSA PUBLIC KEY-----\n";
        KidVerifierHandler kidVerifierHandler = new KidVerifierHandler();
        assertTrue( kidVerifierHandler.verify( kid, key ) );
    }
}
