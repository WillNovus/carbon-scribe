import { create } from 'zustand';
import { createProjectsSlice } from './projects/projectsSlice';
import { createSearchSlice, loadPersistedSearchData } from './search/searchSlice';
import type { ProjectsSlice } from './projects/projects.types';
import type { SearchSlice } from './search/search.types';

// The unified store type — extend with additional slices (e.g. AuthSlice) as needed
export type StoreState = ProjectsSlice & SearchSlice;

export const useStore = create<StoreState>()((...args) => {
  const projectsSlice = createProjectsSlice(...args);
  const searchSlice = createSearchSlice(...args);

  return {
    ...projectsSlice,
    ...searchSlice,
  };
});

// Initialize persisted data on client-side
if (typeof window !== 'undefined') {
  const persistedData = loadPersistedSearchData();
  if (Object.keys(persistedData).length > 0) {
    useStore.setState((state) => ({
      ...state,
      ...persistedData,
    }));
  }
}
