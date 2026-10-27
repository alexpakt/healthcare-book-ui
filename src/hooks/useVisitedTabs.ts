import { useState } from 'react';

/** Tracks which tabs have been opened, so panels can load lazily and then stay mounted. */
export const useVisitedTabs = (initial: string) => {
  const [active, setActive] = useState(initial);
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([initial]));

  const onChange = (value: string | null) => {
    if (!value) return;
    setActive(value);
    setVisited((prev) => (prev.has(value) ? prev : new Set(prev).add(value)));
  };

  return { active, onChange, visited };
};
