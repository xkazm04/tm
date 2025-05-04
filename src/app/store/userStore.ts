import {create} from 'zustand';
import { User, TaskState } from '../lib/types';

export interface Filters {
  search: string;
  userId: string;
  states: TaskState[];
}

interface UserState {
  currentUser: User | null; 
  setCurrentUser: (user: User | null) => void;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  filters: {
    search: '',
    userId: '',
    states: ['new', 'assigned', 'completed'],
  },
  setFilters: (partialFilters) => set((state) => ({
    filters: {
      ...state.filters,
      ...partialFilters
    }
  })),
}));
