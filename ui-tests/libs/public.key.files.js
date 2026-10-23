/**
 * Created on 22.10.2026.
 *
 * The .pem files the 'New public key' dialog's Upload button is pointed at.
 *
 * They are minted here rather than committed: a private key file in the repository trips every
 * secret scanner, and a pair made by node's own crypto is exactly the shape the dialog's reader
 * takes. That reader (features/user-editor/model/key-pair.ts) looks for a
 * '-----BEGIN PUBLIC KEY-----' block and refuses anything holding a private key, whatever the help
 * text says about RSA_X509_PEM - so the private half is a fixture too, for the refusal.
 *
 * The files land under build/, which git ignores.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '../build/fixtures');

module.exports = {
  // Writes a fresh RSA pair as two .pem files - the public half alone and the private half alone -
  // and answers with their absolute paths, which is what the dialog's file input is given.
  writeKeyPairPems(name) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    fs.mkdirSync(DIR, { recursive: true });
    const publicKeyPath = path.join(DIR, `${name}-public.pem`);
    const privateKeyPath = path.join(DIR, `${name}-private.pem`);
    fs.writeFileSync(publicKeyPath, publicKey, 'utf8');
    fs.writeFileSync(privateKeyPath, privateKey, 'utf8');
    return { publicKeyPath, privateKeyPath };
  },
};
