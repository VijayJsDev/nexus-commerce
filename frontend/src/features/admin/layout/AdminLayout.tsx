/**
 * AdminLayout.tsx — Persistent Layout for Tenant Merchant Admin Portal
 *
 * Includes:
 *   - Route protection (redirects to /admin/login if unauthenticated)
 *   - Responsive left sidebar with mobile drawer toggle
 *   - Top header with store badge, storefront quick-link, and status indicators
 *   - Main content viewport with standard padding and scroll container
 */

import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Menu, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useTenantAuthStore } from '@/store/tenantAuth.store';
import { ROUTES } from '@/app/router/routes';

export function AdminLayout(): React.JSX.Element {
  const { isAuthenticated, storeName, tenantId, fetchTenantProfile } = useTenantAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && tenantId) {
      void fetchTenantProfile(tenantId);
    }
  }, [isAuthenticated, tenantId, fetchTenantProfile]);

  // Route protection
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN.LOGIN} replace />;
  }

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      {/* ── 1. Desktop Persistent Left Sidebar ─────────────────────── */}
      <div className="hidden md:flex md:w-64 md:flex-col md:inset-y-0">
        <AdminSidebar />
      </div>

      {/* ── 2. Mobile Responsive Sidebar Drawer ───────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col">
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── 3. Main Content Area ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="border-border bg-card/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="text-muted-foreground hover:text-foreground focus:ring-primary rounded-lg p-2 focus:outline-hidden focus:ring-2 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Tenant identifier chip */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">{storeName}</span>
              <span className="text-muted-foreground font-mono text-xs">/</span>
              <span className="bg-primary/10 text-primary border-primary/20 rounded-md border px-2 py-0.5 text-xs font-medium">
                Admin Portal
              </span>
            </div>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Cloud PostgreSQL & Cloudinary Active</span>
            </div>

            {/* Platform Badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Tenant Isolated</span>
            </div>

            {/* Direct Link to Storefront */}
            <Link
              to={ROUTES.ROOT}
              target="_blank"
              rel="noreferrer"
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
