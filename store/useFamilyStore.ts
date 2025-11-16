import { create } from 'zustand';
import { Family } from '@/types';

interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  families: [],
  currentFamily: null,
  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
}));