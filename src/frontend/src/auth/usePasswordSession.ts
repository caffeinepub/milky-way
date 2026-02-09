import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PasswordSessionState {
  username: string | null;
  password: string | null;
  isAuthenticated: boolean;
  setSession: (username: string, password: string) => void;
  clearSession: () => void;
}

export const usePasswordSession = create<PasswordSessionState>()(
  persist(
    (set) => ({
      username: null,
      password: null,
      isAuthenticated: false,
      setSession: (username: string, password: string) =>
        set({ username, password, isAuthenticated: true }),
      clearSession: () =>
        set({ username: null, password: null, isAuthenticated: false }),
    }),
    {
      name: 'milky-way-session',
    }
  )
);
