import { Button, GridList, IconButton } from '@enonic/ui';
import { Plus, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import type { PublicKey } from '../../../entities/principal';
import { i18n, useI18n } from '../../../shared/i18n';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import { visiblePublicKeys, type PublicKeyRow } from '../model/public-key-changes';
import {
  dropStagedPublicKey,
  keepPublicKey,
  stagePublicKey,
  stagePublicKeyRemoval,
} from '../model/user-editor.store';
import type { UserForm } from '../model/user-form';
import { AddPublicKeyDialog } from './AddPublicKeyDialog';
import { PublicKeyCard } from './PublicKeyCard';

export type PublicKeysSectionProps = {
  form: UserForm;
  /** The keys the user already has. Empty while one is being created. */
  stored: readonly PublicKey[];
};

/**
 * The keys the save will write, staged like every other answer in the wizard: nothing here reaches the
 * server until the last step, and closing the dialog abandons all of it.
 */
export function PublicKeysSection({ form, stored }: PublicKeysSectionProps) {
  const keysLabel = useI18n('users.dialog.publicKeys');
  const noKeysLabel = useI18n('users.dialog.noPublicKeys');
  const addKeyLabel = useI18n('users.dialog.addPublicKey');
  const keepKeyLabel = useI18n('users.dialog.keepPublicKey');
  const removeKeyLabel = (row: PublicKeyRow): string =>
    i18n('users.dialog.removePublicKey', row.label ?? row.kid ?? '');

  const [adding, setAdding] = useState(false);

  const rows = visiblePublicKeys(stored, form);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <FieldLabel text={keysLabel} />

        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          endIcon={Plus}
          label={addKeyLabel}
          onClick={() => setAdding(true)}
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-subtle text-sm">{noKeysLabel}</p>
      ) : (
        <GridList className="flex w-full flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1">
          {rows.map((row) => (
            <GridList.Row key={row.id} id={`${row.id}-key`} className="gap-2.5 p-1">
              {/* ! `min-w-0` is what lets the card truncate: the cell is a flex child and sits at
                  ! `min-width: auto`, so without it the card's full width wins and the button beside
                  ! it is pushed out of the row. */}
              <GridList.Cell
                className={`min-w-0 flex-1 self-stretch ${row.state === 'removed' ? 'text-subtle line-through' : ''}`}
              >
                <PublicKeyCard publicKey={row} />
              </GridList.Cell>

              <GridList.Cell className="shrink-0">
                <GridList.Action>
                  {row.state === 'removed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      label={keepKeyLabel}
                      onClick={() => keepPublicKey(row.id)}
                    />
                  ) : (
                    <IconButton
                      aria-label={removeKeyLabel(row)}
                      icon={X}
                      variant="text"
                      onClick={() =>
                        row.state === 'pending'
                          ? dropStagedPublicKey(row.id)
                          : stagePublicKeyRemoval(row.id)
                      }
                    />
                  )}
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
      )}

      <AddPublicKeyDialog open={adding} onStage={stagePublicKey} onClose={() => setAdding(false)} />
    </div>
  );
}
