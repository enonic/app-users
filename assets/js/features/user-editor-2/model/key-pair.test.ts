import { describe, expect, it } from 'vitest';

import { readPublicKeyPem } from './key-pair';

const publicPem = ['-----BEGIN PUBLIC KEY-----', 'MIIBIjANBg', '-----END PUBLIC KEY-----'].join(
  '\n',
);

const privatePem = [
  '-----BEGIN PRIVATE KEY-----',
  'MIIEvQIBADAN',
  '-----END PRIVATE KEY-----',
].join('\n');

describe('readPublicKeyPem', () => {
  it('answers the block of a file holding the public half', () => {
    expect(readPublicKeyPem(publicPem)).toBe(publicPem);
  });

  it('reads one padded with whitespace, as a file off disk is', () => {
    expect(readPublicKeyPem(`\n  ${publicPem}\n`)).toBe(publicPem);
  });

  it('refuses a file carrying a private half, whichever order the blocks are in', () => {
    expect(readPublicKeyPem(`${privatePem}\n${publicPem}`)).toBeUndefined();
    expect(readPublicKeyPem(`${publicPem}\n${privatePem}`)).toBeUndefined();
    expect(readPublicKeyPem(privatePem)).toBeUndefined();
  });

  it('refuses an encrypted private half, which is armoured differently', () => {
    expect(
      readPublicKeyPem(
        '-----BEGIN ENCRYPTED PRIVATE KEY-----\nx\n-----END ENCRYPTED PRIVATE KEY-----',
      ),
    ).toBeUndefined();
  });

  it('takes only the block, dropping anything around it', () => {
    expect(readPublicKeyPem(`Key for alice\n${publicPem}\ncreated today`)).toBe(publicPem);
  });

  it('answers nothing for anything that is not a public key', () => {
    expect(readPublicKeyPem('')).toBeUndefined();
    expect(readPublicKeyPem('ssh-rsa AAAAB3Nza')).toBeUndefined();
    expect(readPublicKeyPem('-----BEGIN PUBLIC KEY-----')).toBeUndefined();
  });
});
