import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NoteRecord } from './types';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface NoteStore {
  notes: NoteRecord[];
  addNote: (note: Omit<NoteRecord, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString()
            }
          ]
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id)
        }))
    }),
    {
      name: 'ai-job-tracker-notes'
    }
  )
);
