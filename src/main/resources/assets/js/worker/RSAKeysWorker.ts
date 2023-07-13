async function generateRSAKeys() {
    const keyPair = await self.crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048, // 4096
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );


    const privateKey = await exportPrivateKey(keyPair.privateKey);
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const kid = generateKid();

    self.postMessage({
        kid: kid,
        publicKey: publicKey,
        privateKey: privateKey,
    });
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function exportPrivateKey(key) {
    const exported = await self.crypto.subtle.exportKey('pkcs8', key);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = self.btoa(exportedAsString);
    return `-----BEGIN RSA PRIVATE KEY-----\n${exportedAsBase64}\n-----END RSA PRIVATE KEY-----\n`;
}

async function exportPublicKey(key) {
    const exported = await self.crypto.subtle.exportKey('spki', key);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = self.btoa(exportedAsString);
    return `-----BEGIN RSA PUBLIC KEY-----\n${exportedAsBase64}\n-----END RSA PUBLIC KEY-----\n`;
}

function generateKid() {
    return self.crypto.randomUUID();
}


self.onmessage = (e: MessageEvent<string>) => {
    generateRSAKeys();
};

export {};
