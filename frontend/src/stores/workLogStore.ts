import { create } from 'zustand';

interface WorkLogStore {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
}

export const useWorkLogStore = create<WorkLogStore>((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
  pendingAction: null,
  setPendingAction: (action) => set({ pendingAction: action }),
}));
