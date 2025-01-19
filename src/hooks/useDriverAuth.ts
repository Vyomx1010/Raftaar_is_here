import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/axios';

interface Driver {
  id: string;
  email: string;
  fullname: {
    firstname: string;
    lastname: string;
  };
  vehicle: {
    type: string;
    color: string;
    plate: string;
    capacity: number;
  };
  status: 'active' | 'inactive';
}

interface DriverAuthState {
  driver: Driver | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setDriver: (driver: Driver | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    vehicle: Driver['vehicle'];
  }) => Promise<void>;
  logout: () => void;
  toggleStatus: (status: 'active' | 'inactive') => Promise<void>;
}

export const useDriverAuth = create<DriverAuthState>()(
  persist(
    (set, get) => ({
      driver: null,
      token: null,
      loading: false,
      error: null,
      setDriver: (driver) => set({ driver }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/drivers/login', { email, password });
          set({ driver: response.data.driver, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Login failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      signup: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/drivers/signup', {
            fullname: {
              firstname: data.firstname,
              lastname: data.lastname
            },
            email: data.email,
            password: data.password,
            vehicle: data.vehicle
          });
          set({ driver: response.data.driver, token: response.data.token });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Signup failed' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      logout: () => {
        set({ driver: null, token: null, error: null });
      },
      toggleStatus: async (status) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post('/drivers/toggle-status', { status });
          set((state) => ({
            driver: state.driver ? { ...state.driver, status } : null
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update status' });
          throw error;
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'driver-auth-storage',
      partialize: (state) => ({ driver: state.driver, token: state.token })
    }
  )
);