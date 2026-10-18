/**
 * AdminSidebar.tsx — Left-Hand Navigation Sidebar for Tenant Merchant Admin
 */

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Ruler,
  Settings,
  ShoppingBag,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Store,
  X,
} from 'lucide-react';
import { ROUTES } from '@/app/router/routes';
import { useTenantAuthStore } from '@/store/tenantAuth.store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function AdminSidebar({ onCloseMobile, className }: AdminSidebarProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId, storeName, storeLogo, userEmail, logout } = useTenantAuthStore();

  const isProductsRoute = location.pathname.startsWith('/admin/products');
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  const handleLogout = (): void => {
    logout();
    navigate(ROUTES.ADMIN.LOGIN);
  };

  return (
    <aside
      className={cn(
        'bg-card border-border flex h-full w-64 flex-col border-r transition-all duration-300',
        className
      )}
    >
      {/* ── 1. Organization Branding Header ───────────────────────── */}
      <div className="border-border flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="border-border bg-background relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-xs">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Store className="text-primary h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground truncate text-sm font-bold tracking-tight">
              {storeName}
            </h2>
            <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <span className="bg-primary/20 text-primary rounded px-1.5 py-0.2 font-mono font-semibold">
                {tenantId}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── 2. Navigation Menu ────────────────────────────────────── */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 text-sm font-medium">
        {/* A. Dashboard */}
        <NavLink
          to={ROUTES.ADMIN.DASHBOARD}
          onClick={onCloseMobile}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        {/* B. Products Menu (Collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors',
              isProductsRoute
                ? 'bg-muted/70 text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 shrink-0" />
              <span>Products</span>
            </div>
            {isProductsOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Sub-sections */}
          {isProductsOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-border/60 pl-3">
              <NavLink
                to={ROUTES.ADMIN.PRODUCTS}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Package className="h-3.5 w-3.5" />
                <span>All Products</span>
              </NavLink>

              <NavLink
                to={ROUTES.ADMIN.CATEGORIES}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span>Product Categories</span>
              </NavLink>

              <NavLink
                to={ROUTES.ADMIN.MEASUREMENTS}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>Measurements</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* C. Organization Settings */}
        <NavLink
          to={ROUTES.ADMIN.SETTINGS}
          onClick={onCloseMobile}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Organization Settings</span>
        </NavLink>

        {/* D. Orders (Coming Soon) */}
        <NavLink
          to={ROUTES.ADMIN.ORDERS}
          onClick={onCloseMobile}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span>Orders</span>
          </div>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
            Soon
          </span>
        </NavLink>
      </nav>

      {/* ── 3. Sidebar Footer ─────────────────────────────────────── */}
      <div className="border-border space-y-3 border-t p-3">
        {/* View Storefront Link */}
        <a
          href={ROUTES.ROOT}
          target="_blank"
          rel="noreferrer"
          className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="h-3.5 w-3.5 text-primary" />
            <span>View Public Store</span>
          </span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Profile & Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col overflow-hidden pr-2">
            <span className="text-foreground truncate text-xs font-semibold">Store Admin</span>
            <span className="text-muted-foreground truncate text-[11px] font-mono">{userEmail}</span>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
