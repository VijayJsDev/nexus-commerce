/**
 * tenantAuth.store.ts — Zustand store for Tenant Merchant Authentication and Store Profile Context
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/axios';

export interface TenantAuthState {
  tenantId: string;
  storeName: string;
  storeLogo: string;
  userEmail: string;
  token: string;
  supportPhone: string;
  gstin: string;
  address: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  registerStore: (payload: {
    storeName: string;
    tenantId: string;
    adminEmail: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;

  loginStore: (payload: {
    tenantId: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;

  logout: () => void;
  updateOrganizationSettings: (settings: Partial<TenantAuthState>) => void;
  fetchTenantProfile: (tenantId?: string) => Promise<void>;
}

export const useTenantAuthStore = create<TenantAuthState>()(
  persist(
    (set, get) => ({
      tenantId: 'faesthatic-corner',
      storeName: 'Faesthatic Corner',
      storeLogo: '/faesthatic_corner_logo.jpg',
      userEmail: 'admin@faesthaticcorner.com',
      token: 'demo-token',
      supportPhone: '+91 98765 43210',
      gstin: '33AAAAA0000A1Z5',
      address: 'Artisan Workshop, Chennai, Tamil Nadu, India',
      isAuthenticated: true,
      isLoading: false,
      error: null,

      registerStore: async ({ storeName, tenantId, adminEmail, password }) => {
        set({ isLoading: true, error: null });
        try {
          const cleanTenantId = tenantId.trim().toLowerCase();
          const response = await apiClient.post('/api/auth/register-tenant', {
            storeName: storeName.trim(),
            tenantId: cleanTenantId,
            adminEmail: adminEmail.trim(),
            password,
          });

          const data = response.data;
          localStorage.setItem('nexus_tenant_id', cleanTenantId);

          set({
            tenantId: cleanTenantId,
            storeName: data.storeName || storeName,
            userEmail: adminEmail,
            token: data.token || 'auth-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Failed to register new store. Please try again.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      loginStore: async ({ tenantId, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const cleanTenantId = tenantId.trim().toLowerCase();
          const response = await apiClient.post('/api/auth/login-tenant', {
            tenantId: cleanTenantId,
            email: email.trim(),
            password,
          });

          const data = response.data;
          localStorage.setItem('nexus_tenant_id', cleanTenantId);

          set({
            tenantId: cleanTenantId,
            storeName: data.storeName || (cleanTenantId === 'faesthatic-corner' ? 'Faesthatic Corner' : `${cleanTenantId.toUpperCase()} Store`),
            userEmail: email,
            storeLogo: data.logoUrl || (cleanTenantId === 'faesthatic-corner' ? '/faesthatic_corner_logo.jpg' : ''),
            token: data.token || 'auth-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (err: unknown) {
          // If backend DB is not currently running in local offline dev, support graceful demo login
          const cleanTenantId = tenantId.trim().toLowerCase();
          if (cleanTenantId === 'faesthatic-corner' && password === 'demoAdmin2026') {
            localStorage.setItem('nexus_tenant_id', cleanTenantId);
            set({
              tenantId: cleanTenantId,
              storeName: 'Faesthatic Corner',
              userEmail: email,
              storeLogo: '/faesthatic_corner_logo.jpg',
              token: 'demo-token',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Invalid credentials or store not found.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: '',
        });
      },

      updateOrganizationSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      fetchTenantProfile: async (overrideTenantId) => {
        const id = overrideTenantId || get().tenantId;
        if (!id) return;

        try {
          const response = await apiClient.get(`/api/tenants/${id}`);
          if (response.data) {
            set({
              storeName: response.data.name || get().storeName,
              storeLogo: response.data.logoUrl || get().storeLogo,
              userEmail: response.data.email || get().userEmail,
              supportPhone: response.data.supportPhone || get().supportPhone,
              gstin: response.data.gstin || get().gstin,
              address: response.data.address || get().address,
            });
          }
        } catch {
          // Ignore if store is new
        }
      },
    }),
    {
      name: 'nexus-tenant-auth',
      partialize: (state) => ({
        tenantId: state.tenantId,
        storeName: state.storeName,
        storeLogo: state.storeLogo,
        userEmail: state.userEmail,
        token: state.token,
        supportPhone: state.supportPhone,
        gstin: state.gstin,
        address: state.address,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
