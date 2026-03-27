import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobRecord } from './types';

interface JobStore {
  jobs: JobRecord[];
  addJob: (job: Omit<JobRecord, 'id' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<JobRecord>) => void;
  deleteJob: (id: string) => void;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      jobs: [],
      addJob: (job) =>
        set((state) => ({
          jobs: [
            ...state.jobs,
            {
              ...job,
              id: generateId(),
              updatedAt: new Date().toISOString()
            }
          ]
        })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, ...updates, updatedAt: new Date().toISOString() }
              : job
          )
        })),
      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id)
        }))
    }),
    {
      name: 'ai-job-tracker-storage'
    }
  )
);
