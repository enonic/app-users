import { Button, Input } from '@enonic/ui';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'preact/hooks';

import type { PublicKey } from '../../entities/principal';
import { useI18n } from '../../shared/i18n';
import { ModalDialog } from '../../shared/ui/dialogs/ModalDialog';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { generateKeyPair, readPublicKeyPem, type KeyPair } from './model/key-pair';

export type AddPublicKeyDialogProps = {
  open: boolean;
  onAdd: (publicKey: string, label?: string) => Promise<AddOutcome>;
  onGenerated: (pair: KeyPair, stored: PublicKey) => void;
  onClose: () => void;
};

export type AddOutcome = { stored: PublicKey } | { error: string };

const LABEL_ID = 'public-key-label';

export function AddPublicKeyDialog({ open, onAdd, onGenerated, onClose }: AddPublicKeyDialogProps) {
  const title = useI18n('users.dialog.addKeyTitle');
  const labelLabel = useI18n('users.dialog.keyLabel');
  const helpText = useI18n('users.dialog.addKeyHelp');
  const generateLabel = useI18n('users.dialog.generateKey');
  const uploadLabel = useI18n('users.dialog.uploadKey');
  const notPublicLabel = useI18n('users.dialog.keyNotPublic');
  const generateFailedLabel = useI18n('users.dialog.keyGenerateFailed');
  const uploadFailedLabel = useI18n('users.dialog.keyReadFailed');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const named = label.trim().length > 0 ? label.trim() : undefined;
  const unnamed = named === undefined;

  const finish = (error: string | undefined): void => {
    setBusy(false);
    setFailure(error);

    if (error === undefined) {
      setLabel('');
      onClose();
    }
  };

  const handleGenerate = async (): Promise<void> => {
    setBusy(true);
    setFailure(undefined);

    try {
      const pair = await generateKeyPair();
      const outcome = await onAdd(pair.publicKey, named);

      if ('stored' in outcome) {
        onGenerated(pair, outcome.stored);
      }

      finish('error' in outcome ? outcome.error : undefined);
    } catch (thrown) {
      finish(messageOf(thrown, generateFailedLabel));
    }
  };

  const handleUpload = async (file: File): Promise<void> => {
    setBusy(true);
    setFailure(undefined);

    try {
      const publicKey = readPublicKeyPem(await file.text());

      if (publicKey === undefined) {
        setBusy(false);
        setFailure(notPublicLabel);
        return;
      }

      const outcome = await onAdd(publicKey, named);
      finish('error' in outcome ? outcome.error : undefined);
    } catch (thrown) {
      finish(messageOf(thrown, uploadFailedLabel));
    }
  };

  return (
    <ModalDialog
      open={open}
      title={title}
      primaryLabel={generateLabel}
      primaryDisabled={busy || unnamed}
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      error={failure}
      onPrimary={() => void handleGenerate()}
      onClose={() => {
        if (busy) {
          return;
        }

        setLabel('');
        setFailure(undefined);
        onClose();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={labelLabel} required htmlFor={LABEL_ID} />
          <Input
            id={LABEL_ID}
            value={label}
            onInput={({ currentTarget }) => setLabel(currentTarget.value)}
          />
        </div>

        <p className="text-subtle text-sm">{helpText}</p>

        <input
          ref={fileRef}
          type="file"
          accept=".pem,application/x-pem-file"
          className="hidden"
          onChange={({ currentTarget }) => {
            const [file] = currentTarget.files ?? [];
            currentTarget.value = '';
            if (file !== undefined) {
              void handleUpload(file);
            }
          }}
        />

        <Button
          className="self-start"
          variant="outline"
          size="sm"
          endIcon={Upload}
          label={uploadLabel}
          disabled={busy || unnamed}
          onClick={() => fileRef.current?.click()}
        />
      </div>
    </ModalDialog>
  );
}

function messageOf(thrown: unknown, fallback: string): string {
  return thrown instanceof Error && thrown.message.length > 0 ? thrown.message : fallback;
}
