/**
 * AdminDashboardPage.tsx — Merchant Admin Overview & Active Upgrade Status
 *
 * Displays:
 *   - "Under Upgrade / Active Development" hero banner with animated emojis (🛠️ ⚙️ ⚡ 🚀)
 *   - Key statistics (Products, Categories, UOMs, Profile completeness)
 *   - Quick action shortcuts directly into catalog management and store configuration
 *   - System status indicators (Multi-tenant isolation, Cloudinary CDN, PostgreSQL)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Ruler,
  Settings,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Cloud,
  Layers,
  Store,
} from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import { useTenantAuthStore } from '@/store/tenantAuth.store';
import { apiClient } from '@/lib/axios';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  uomsCount: number;
  isLoading: boolean;
}

export function AdminDashboardPage(): React.JSX.Element {
  const { storeName, tenantId, userEmail, gstin, address } = useTenantAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    uomsCount: 7, // 7 default standard UOMs seeded
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [productsRes, categoriesRes, uomsRes] = await Promise.allSettled([
          apiClient.get('/api/products'),
          apiClient.get('/api/categories'),
          apiClient.get('/api/uoms'),
        ]);

        if (isMounted) {
          const productsCount =
            productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data)
              ? productsRes.value.data.length
              : 0;
          const categoriesCount =
            categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value.data)
              ? categoriesRes.value.data.length
              : 0;
          const uomsCount =
            uomsRes.status === 'fulfilled' && Array.isArray(uomsRes.value.data)
              ? uomsRes.value.data.length
              : 7;

          setStats({
            productsCount,
            categoriesCount,
            uomsCount,
            isLoading: false,
          });
        }
      } catch {
        if (isMounted) {
          setStats((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  // Profile readiness calculation
  const hasGstin = Boolean(gstin && gstin.trim().length > 0);
  const hasAddress = Boolean(address && address.trim().length > 0);
  const readinessPercent = 50 + (hasGstin ? 25 : 0) + (hasAddress ? 25 : 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* ── 1. Hero Under Upgrade & Welcome Banner ─────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-card via-card to-primary/5 p-6 shadow-xl sm:p-8">
        {/* Decorative blur orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            {/* Status Pill with Animated Emojis */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1 text-sm animate-pulse">
                <span>🛠️</span>
                <span>⚙️</span>
                <span>⚡</span>
                <span>🚀</span>
              </span>
              <span>Platform Upgrade Active • Phase 2 SaaS Engine</span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Welcome to {storeName} Admin Portal
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
              Manage your complete catalog master with Indian GST compliance, Cloudinary product imagery,
              and real-time PostgreSQL database isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.ADMIN.PRODUCTS}
              className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Package className="h-4 w-4" />
              <span>Manage Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.ADMIN.SETTINGS}
              className="border-border bg-card hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Store Settings</span>
            </Link>
          </div>
        </div>

        {/* Tenant Meta Info bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-border/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Store className="h-4 w-4 text-primary" />
            <span>Tenant ID:</span>
            <span className="font-mono font-semibold text-foreground">{tenantId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Admin:</span>
            <span className="font-mono text-foreground">{userEmail}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="h-4 w-4 text-sky-500" />
            <span>CDN:</span>
            <span className="text-foreground">Cloudinary DotNet v1.29</span>
          </div>
        </div>
      </div>

      {/* ── 2. Real-time Metric Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Products Card */}
        <div className="border-border bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Total Products
            </span>
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              {stats.isLoading ? '...' : stats.productsCount}
            </span>
            <span className="text-muted-foreground text-xs">items in catalog</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> 11-field Master
            </span>
            <Link
              to={ROUTES.ADMIN.PRODUCTS}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              View <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Categories Card */}
        <div className="border-border bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Categories
            </span>
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex h-10 w-10 items-center justify-center rounded-xl">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              {stats.isLoading ? '...' : stats.categoriesCount}
            </span>
            <span className="text-muted-foreground text-xs">master taxonomies</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Self-managed</span>
            <Link
              to={ROUTES.ADMIN.CATEGORIES}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Configure <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Measurements (UOM) Card */}
        <div className="border-border bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Units of Measurement
            </span>
            <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 flex h-10 w-10 items-center justify-center rounded-xl">
              <Ruler className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              {stats.isLoading ? '...' : stats.uomsCount}
            </span>
            <span className="text-muted-foreground text-xs">active units</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-sky-600 dark:text-sky-400 font-medium">Auto-provisioned</span>
            <Link
              to={ROUTES.ADMIN.MEASUREMENTS}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Store Readiness Card */}
        <div className="border-border bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Profile Readiness
            </span>
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex h-10 w-10 items-center justify-center rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              {readinessPercent}%
            </span>
            <span className="text-muted-foreground text-xs">configured</span>
          </div>
          <div className="mt-3">
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Quick Action Hub ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            Catalog Management Modules
          </h2>
          <span className="text-muted-foreground text-xs">Direct access to tenant masters</span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Module 1: Product Master */}
          <Link
            to={ROUTES.ADMIN.PRODUCTS}
            className="group border-border bg-card hover:border-primary/50 relative flex flex-col justify-between rounded-2xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div>
              <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-foreground mt-4 text-base font-bold">Product Master Catalog</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Add and edit products with SKU, Unit Rate, Effective Date, Indian GST rates (CGST 9%, SGST 9%, IGST 18%), HSN codes, and Cloudinary image upload.
              </p>
            </div>
            <div className="text-primary mt-6 flex items-center gap-1.5 text-xs font-semibold">
              <span>Open Product Master</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 2: Categories Master */}
          <Link
            to={ROUTES.ADMIN.CATEGORIES}
            className="group border-border bg-card hover:border-amber-500/50 relative flex flex-col justify-between rounded-2xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div>
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="text-foreground mt-4 text-base font-bold">Category Taxonomies</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Create and organize your store’s category tree. Categories feed directly into product creation and public storefront filters.
              </p>
            </div>
            <div className="text-amber-600 dark:text-amber-400 mt-6 flex items-center gap-1.5 text-xs font-semibold">
              <span>Manage Categories</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 3: Units of Measurement */}
          <Link
            to={ROUTES.ADMIN.MEASUREMENTS}
            className="group border-border bg-card hover:border-sky-500/50 relative flex flex-col justify-between rounded-2xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div>
              <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                <Ruler className="h-6 w-6" />
              </div>
              <h3 className="text-foreground mt-4 text-base font-bold">Measurement Units (UOM)</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Standard units (PCS, Pack, Set, Box, Pair, Kg, Litre) auto-provisioned upon store registration. Add custom units anytime.
              </p>
            </div>
            <div className="text-sky-600 dark:text-sky-400 mt-6 flex items-center gap-1.5 text-xs font-semibold">
              <span>Manage Units</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── 4. Architecture & Compliance Overview ─────────────────── */}
      <div className="border-border bg-card rounded-2xl border p-6">
        <h3 className="text-foreground text-sm font-bold uppercase tracking-wider text-muted-foreground">
          System Guarantees & Multi-Tenant Stack
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-border/60 bg-muted/30 flex items-start gap-3 rounded-xl border p-3.5">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Layers className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-foreground text-xs font-bold">Tenant Isolation</h4>
              <p className="text-muted-foreground text-[11px] leading-snug">
                Every query is filtered by <code className="text-primary font-mono">TenantId</code> via EF Core & PostgreSQL.
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-muted/30 flex items-start gap-3 rounded-xl border p-3.5">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg p-2">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-foreground text-xs font-bold">Indian GST Compliant</h4>
              <p className="text-muted-foreground text-[11px] leading-snug">
                Automated CGST (9%), SGST (9%), IGST (18%) tax computation and HSN code validation.
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-muted/30 flex items-start gap-3 rounded-xl border p-3.5">
            <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg p-2">
              <Cloud className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-foreground text-xs font-bold">Cloudinary Media CDN</h4>
              <p className="text-muted-foreground text-[11px] leading-snug">
                Drag-and-drop image upload directly optimized through Cloudinary CDN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
