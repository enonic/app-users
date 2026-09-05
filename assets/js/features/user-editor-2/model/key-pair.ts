export type KeyPair = {
  publicKey: string;
  privateKey: string;
};

const ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
} satisfies RsaHashedKeyGenParams;

export async function generateKeyPair(): Promise<KeyPair> {
  const pair = await crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);

  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
  ]);

  return {
    publicKey: toPem(publicKey, 'PUBLIC KEY'),
    privateKey: toPem(privateKey, 'PRIVATE KEY'),
  };
}

const PUBLIC_BLOCK = /-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----/;

export function readPublicKeyPem(value: string): string | undefined {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value)) {
    return undefined;
  }

  return PUBLIC_BLOCK.exec(value.trim())?.[0];
}

function toPem(key: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(key);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const lines = btoa(binary).match(/.{1,64}/g) ?? [];

  return [`-----BEGIN ${label}-----`, ...lines, `-----END ${label}-----`].join('\n');
}
