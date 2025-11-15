import { create } from 'zustand';
import { Family, FamilyTree } from '@/types';

interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  currentTree: FamilyTree | null;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
  setCurrentTree: (tree: FamilyTree | null) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  families: [],
  currentFamily: null,
  currentTree: null,
  setFamilies: (families) => set({ families }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
  setCurrentTree: (tree) => set({ currentTree: tree }),
}));