import { AppRoot, Skeleton } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import type { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { GroupsPage } from '../pages/groups/GroupsPage';
import { IdProvidersPage } from '../pages/id-providers/IdProvidersPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { UsersPage } from '../pages/users/UsersPage';
import type { Host } from '../shared/sections';
import { $stylesheets } from '../shared/styles';
import { $bootstrap } from './bootstrap.store';
import { startSectionEvents, stopSectionEvents } from './events';
import type { Section } from './section';

export type AppProps = {
  host: Host;
  section: Section;
};

const PAGES: Record<Section, FunctionComponent> = {
  users: UsersPage,
  groups: GroupsPage,
  roles: RolesPage,
  'id-providers': IdProvidersPage,
};

export function App({ host, section }: AppProps) {
  const { status, error } = useStore($bootstrap);
  const stylesheets = useStore($stylesheets);
  const [theme, setTheme] = useState(host.theme.get());

  useEffect(() => host.theme.subscribe(setTheme), [host]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    startSectionEvents(section);
    return stopSectionEvents;
  }, [status, section]);

  const Page = PAGES[section];

  // ! `AppRoot` adopts the sheet, sets the theme class (`.dark` never crosses the shadow boundary)
  // ! and portals overlays inside this root. Needs `@enonic/ui` >= 1.2.0.
  return (
    <AppRoot theme={theme} stylesheets={stylesheets} className="flex min-h-0 flex-1 flex-col">
      {status === 'loading' && <BootstrapSkeleton />}
      {status === 'error' && <BootstrapFailed error={error} />}
      {status === 'ready' && <Page />}
    </AppRoot>
  );
}

//
// * Internal
//

function BootstrapSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-10" aria-busy="true">
      <Skeleton shape="rectangle" size="lg" className="w-64" />

      <Skeleton.Group className="flex flex-col gap-2">
        <Skeleton shape="rectangle" size="sm" />
        <Skeleton shape="rectangle" size="md" className="w-96" />
        <Skeleton shape="rectangle" size="md" className="w-80" />
      </Skeleton.Group>
    </div>
  );
}

function BootstrapFailed({ error }: { error?: string }) {
  return (
    <div className="text-main flex flex-col gap-2 p-10" role="alert">
      <h2 className="text-lg font-semibold">This section could not be loaded</h2>
      {error != null && <p className="text-subtle text-sm">{error}</p>}
    </div>
  );
}
