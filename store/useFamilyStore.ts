import { Family } from '@/types/models';
import { create } from 'zustand';

type FamilyStoreState = {
  families: Family[];
  currentFamily: Family | null;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
};

export const useFamilyStore = create<FamilyStoreState>((set) => ({
  families: [],
  currentFamily: null,
  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
}));