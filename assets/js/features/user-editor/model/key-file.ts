import type { PublicKey, User } from '../../../entities/principal';
import type { KeyPair } from './key-pair';

/** Hands the private half to its owner, and answers with the name it was saved under. */
export function downloadPrivateKey(
  user: User | undefined,
  pair: KeyPair,
  stored: PublicKey,
): string {
  const body = JSON.stringify(
    {
      algorithm: 'RSA',
      kid: stored.kid,
      label: stored.label,
      principalKey: user?.key,
      privateKey: pair.privateKey,
    },
    undefined,
    2,
  );

  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
  const anchor = document.createElement('a');

  const fileName = `${user?.login ?? 'user'}-${stored.kid}.json`;

  anchor.href = url;
  anchor.download = fileName;

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);

  return fileName;
}
