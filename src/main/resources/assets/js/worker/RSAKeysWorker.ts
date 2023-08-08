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
    const kid = await generateKid(keyPair.publicKey);

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

async function generateKid(publicKey) {
    const publicKeyData = new Uint8Array(await self.crypto.subtle.exportKey('spki', publicKey));
    const publicKeyHashBuffer = await crypto.subtle.digest('SHA-512', publicKeyData);
    const bytesArray = new Uint8Array(publicKeyHashBuffer, 0, 16);

    return Array.from(bytesArray, (byte) => {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
}

self.onmessage = (e: MessageEvent<string>) => {
    generateRSAKeys();
};

export {};
