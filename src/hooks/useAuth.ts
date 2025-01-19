import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/axios';

interface User {
  id: string;
  email: string;
  fullname: {
    firstname: string;
    lastname: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  signup: (data: { firstname: string; lastname: string; email: string; password: string }) => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  signupWithFacebook: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/login', { email, password });
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Login failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      loginWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/google-login');
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Google login failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      loginWithFacebook: async () => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/facebook-login');
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Facebook login failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      signup: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/signup', {
            fullname: {
              firstname: data.firstname,
              lastname: data.lastname
            },
            email: data.email,
            password: data.password
          });
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Signup failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      signupWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/google-signup');
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Google signup failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      signupWithFacebook: async () => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/users/facebook-signup');
          set({ user: response.data.user, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Facebook signup failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      logout: () => {
        set({ user: null, token: null, error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);