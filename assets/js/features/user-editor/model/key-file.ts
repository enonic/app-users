import type { PublicKey, User } from '../../../entities/principal';
import type { KeyPair } from './key-pair';

export function downloadPrivateKey(user: User | undefined, pair: KeyPair, stored: PublicKey): void {
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

  anchor.href = url;
  anchor.download = `${user?.login ?? 'user'}-${stored.kid}.json`;

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
