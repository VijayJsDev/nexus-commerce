/**
 * OrdersPage.tsx — Orders & GST Invoicing Management (Coming Soon)
 */

import { ShoppingBag, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';

export function OrdersPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-6 w-6" />
            <h1 className="text-foreground text-2xl font-black tracking-tight">Orders & Invoicing</h1>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Live order tracking, customer details, and automated Indian GST tax invoices.
          </p>
        </div>

        <Link
          to={ROUTES.ADMIN.DASHBOARD}
          className="border-border bg-card hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* ── Feature Teaser Card ────────────────────────────────────── */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-8 shadow-xs text-center sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-xl space-y-4">
          <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <Clock className="h-8 w-8" />
          </div>

          <h2 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
            Order Fulfillment Module Under Construction
          </h2>

          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            We are actively completing Phase 2 (Product Catalog Master, Categories, UOMs, and Indian GST Tax calculation).
            Orders processing with customer address parsing and automated PDF invoice generation will follow immediately next.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-xs font-medium">
              📦 Shipment Tracking
            </span>
            <span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-xs font-medium">
              🧾 GST Tax Invoices
            </span>
            <span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-xs font-medium">
              💳 Payment Status
            </span>
          </div>

          <div className="pt-6">
            <Link
              to={ROUTES.ADMIN.PRODUCTS}
              className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore Product Master Instead</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
