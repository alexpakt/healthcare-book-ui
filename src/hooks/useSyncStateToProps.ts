import { useState } from 'react';

export function useSyncStateToProps(dependencies: readonly unknown[], sync: () => void) {
  const [lastDeps, setLastDeps] = useState<readonly unknown[] | null>(null);
  const changed = lastDeps === null || dependencies.some((dep, i) => !Object.is(dep, lastDeps[i]));

  if (changed) {
    setLastDeps(dependencies);
    sync();
  }
}
