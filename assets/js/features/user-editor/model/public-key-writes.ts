import { addPublicKey, removePublicKey, type PrincipalKey } from '../../../entities/principal';
import type { KeyPair } from './key-pair';
import type { UserForm } from './user-form';

export type GeneratedKeyFile = {
  pair: KeyPair;
  stored: { kid: string; label?: string };
};

export type PublicKeyWriteOutcome = {
  /** One file per generated pair, handed over only now that the key is really on the user. */
  downloads: readonly GeneratedKeyFile[];
  failed: number;
};

/**
 * Writes what the wizard staged, once the user itself is written.
 *
 * ! The user is saved by the time this runs, so a refused key cannot fail the save — it is counted and
 * ! reported. Requests here are serialized anyway, so the loop costs nothing a batch would save.
 */
export async function applyPublicKeyChanges(
  key: PrincipalKey,
  form: UserForm,
): Promise<PublicKeyWriteOutcome> {
  const downloads: GeneratedKeyFile[] = [];
  let failed = 0;

  for (const kid of form.keyRemovals) {
    const removed = await removePublicKey(key, kid);

    if (removed.isErr()) {
      failed += 1;
    }
  }

  for (const pending of form.keyAdditions) {
    const written = await addPublicKey(key, pending.publicKey, pending.label);

    written.match(
      (stored) => {
        if (pending.privateKey !== undefined) {
          downloads.push({
            pair: { publicKey: pending.publicKey, privateKey: pending.privateKey },
            stored,
          });
        }
      },
      () => {
        failed += 1;
      },
    );
  }

  return { downloads, failed };
}
