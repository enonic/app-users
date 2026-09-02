import {
  Button,
  Checkbox,
  Combobox,
  GridList,
  IconButton,
  Listbox,
  Selector,
  useCombobox,
} from '@enonic/ui';
import { X } from 'lucide-react';
import { useState } from 'preact/hooks';

import { useRepositories, type Repository } from '../../entities/repository';
import { useConfig } from '../../shared/config';
import { useHostFrame } from '../../shared/host';
import { i18n, useI18n } from '../../shared/i18n';
import { SelectorPopup } from '../../shared/ui/SelectorPopup';
// ? The one place a feature reaches for a widget. The section it contributes sits among the panel's
// ? own sections and has to look like one, and the details panel is where that chrome is written down.
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import {
  defaultBranchOf,
  downloadPermissionReport,
  reportTargets,
} from './model/permission-report';

export type PermissionReportSectionProps = {
  /** The user, group or role the report answers for. */
  principalKey: string;
};

/**
 * "What may this principal do in the content tree?" — a question no other screen answers, since the
 * grants reaching a person arrive through every group and role they hold.
 *
 * ! The administrator check is here rather than in the three panels that render this, and outside the
 * ! section's own hooks: a user administrator may open these panels and may not have this, so the
 * ! repository list must not even be asked for.
 */
export function PermissionReportSection({ principalKey }: PermissionReportSectionProps) {
  const config = useConfig();

  if (config?.admin !== true) {
    return null;
  }

  // ! Keyed, because the panel keeps this instance when the selected row changes: without it another
  // ! principal inherits the repositories picked for the last one, and a generation still running
  // ! leaves their button reading "Generating…".
  return <ReportSection key={principalKey} principalKey={principalKey} />;
}

function ReportSection({ principalKey }: PermissionReportSectionProps) {
  const { host, notifyError } = useHostFrame();
  const { status, items } = useRepositories();

  const placeholder = useI18n('report.repositoriesPlaceholder');
  const generateLabel = useI18n('report.generate');
  const generatingLabel = useI18n('report.generating');
  const emptyLabel = useI18n('report.empty');
  const failedLabel = useI18n('report.failed');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<readonly string[]>([]);
  const [branchOf, setBranchOf] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);

  const offered = items.filter(({ id }) => id.toLowerCase().includes(query.toLowerCase()));
  const rows = items.filter(({ id }) => picked.includes(id));

  /**
   * ! One at a time, awaited. Repository by repository is also how the browser wants them: several
   * ! saves fired at once is what makes Chrome ask whether to allow multiple downloads.
   */
  const generate = async (): Promise<void> => {
    setRunning(true);

    for (const target of reportTargets(principalKey, items, picked, branchOf)) {
      const result = await downloadPermissionReport(host.baseUrl, target);

      if (result.isErr()) {
        notifyError(i18n('report.downloadFailed', target.repositoryId));
      }
    }

    setRunning(false);
  };

  return (
    <DetailsPanel.Section
      labelKey="report.section"
      action={
        <Button
          variant="outline"
          size="sm"
          label={running ? generatingLabel : generateLabel}
          disabled={running || rows.length === 0}
          onClick={() => void generate()}
        />
      }
    >
      {status === 'error' && <p className="text-error text-sm">{failedLabel}</p>}

      {status === 'ready' && items.length === 0 && (
        <p className="text-subtle text-sm">{emptyLabel}</p>
      )}

      <Combobox
        open={open}
        onOpenChange={setOpen}
        value={query}
        onChange={(next) => setQuery(next ?? '')}
        selectionMode="multiple"
        selection={picked}
        onSelectionChange={setPicked}
        contentType="listbox"
      >
        <Combobox.Content>
          <Combobox.Control>
            <Combobox.Search>
              <Combobox.SearchIcon />
              <Combobox.Input aria-label={placeholder} placeholder={placeholder} />
              <Combobox.Toggle />
            </Combobox.Search>
          </Combobox.Control>

          <Combobox.Portal>
            <Combobox.Popup>
              <RepositoryOptions repositories={offered} />
            </Combobox.Popup>
          </Combobox.Portal>
        </Combobox.Content>
      </Combobox>

      {rows.length > 0 && (
        <GridList className="flex flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1">
          {rows.map((repository) => (
            <GridList.Row
              key={repository.id}
              id={`${repository.id}-picked`}
              className="gap-2.5 p-1"
            >
              <GridList.Cell interactive={false} className="flex-1 self-stretch">
                <span className="truncate text-sm">{repository.id}</span>
              </GridList.Cell>

              <GridList.Cell>
                <Selector.Root
                  value={branchOf[repository.id] ?? defaultBranchOf(repository)}
                  onValueChange={(branch) =>
                    setBranchOf((current) => ({ ...current, [repository.id]: branch }))
                  }
                >
                  <Selector.Trigger
                    aria-label={i18n('report.branchFor', repository.id)}
                    className="w-40"
                  >
                    <Selector.Value />
                    <Selector.Icon />
                  </Selector.Trigger>
                  <SelectorPopup>
                    {repository.branches.map((branch) => (
                      <Selector.Item key={branch} value={branch} textValue={branch}>
                        <Selector.ItemText>{branch}</Selector.ItemText>
                      </Selector.Item>
                    ))}
                  </SelectorPopup>
                </Selector.Root>
              </GridList.Cell>

              <GridList.Cell>
                <GridList.Action>
                  <IconButton
                    aria-label={i18n('report.remove', repository.id)}
                    icon={X}
                    variant="text"
                    onClick={() =>
                      setPicked((current) => current.filter((id) => id !== repository.id))
                    }
                  />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          ))}
        </GridList>
      )}
    </DetailsPanel.Section>
  );
}

type RepositoryOptionsProps = {
  repositories: readonly Repository[];
};

function RepositoryOptions({ repositories }: RepositoryOptionsProps) {
  // The combobox's own selection, which is the applied one here: every click commits.
  const { selection } = useCombobox();

  return (
    <Combobox.ListContent className="max-h-60 overflow-y-auto">
      {repositories.map(({ id }) => (
        <Listbox.Item key={id} value={id} className="px-2.5 py-1.5">
          <span className="flex-1 truncate text-sm">{id}</span>
          <Checkbox
            tabIndex={-1}
            checked={selection.has(id)}
            onClick={(event) => event.preventDefault()}
          />
        </Listbox.Item>
      ))}
    </Combobox.ListContent>
  );
}
