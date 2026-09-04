import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { loadRepositories } from './repositories.load';
import { $repositories, type RepositoriesState } from './repositories.store';

/**
 * ? Reads and loads, where every other hook in this app only reads. The rule holds because a screen
 * ? owns what its own request asks for — but nothing here is a screen's: the list is needed by one
 * ? panel section, shown only to an administrator, and hanging it off the four screens' requests would
 * ? make every visitor pay for a list most of them may not even have.
 */
export function useRepositories(): RepositoriesState {
  useEffect(() => {
    void loadRepositories();
  }, []);

  return useStore($repositories);
}
