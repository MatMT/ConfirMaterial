import { create } from 'zustand';

interface UserProfile {
  id: string;
  firstName: string;
  lastNames: string;
  role: 'student' | 'teacher' | 'admin';
  credential?: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  setUser: (user: UserProfile | null) => void;
}

// Para la sesión no usamos persist porque la verdad de la sesión
// la dicta la cookie httpOnly de Supabase. El cliente la leerá de Astro
// o Supabase JS y actualizará este store al inicio.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
}));
