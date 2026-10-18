/**
 * OrganizationSettingsPage.tsx — Tenant Store Settings & GST Details
 *
 * Manages store profile: Store Name, Logo, Email, Support Phone,
 * GSTIN (15-digit), and Workshop/Warehouse Address.
 * Persists updates to PUT /api/tenants/{tenantId} and the Zustand auth store.
 */

import { useState } from 'react';
import {
  Settings,
  Store,
  Mail,
  Phone,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  ShieldCheck,
} from 'lucide-react';
import { useTenantAuthStore } from '@/store/tenantAuth.store';
import { apiClient } from '@/lib/axios';

export function OrganizationSettingsPage(): React.JSX.Element {
  const {
    tenantId,
    storeName,
    storeLogo,
    userEmail,
    supportPhone,
    gstin,
    address,
    updateOrganizationSettings,
  } = useTenantAuthStore();

  const [formData, setFormData] = useState({
    name: storeName,
    logoUrl: storeLogo,
    email: userEmail,
    supportPhone: supportPhone || '',
    gstin: gstin || '',
    address: address || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await apiClient.put(`/api/tenants/${tenantId}`, {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl.trim() || undefined,
        email: formData.email.trim(),
        supportPhone: formData.supportPhone.trim() || undefined,
        gstin: formData.gstin.trim() || undefined,
        address: formData.address.trim() || undefined,
      });

      if (response.data) {
        updateOrganizationSettings({
          storeName: formData.name,
          storeLogo: formData.logoUrl,
          userEmail: formData.email,
          supportPhone: formData.supportPhone,
          gstin: formData.gstin,
          address: formData.address,
        });
        setSuccessMessage('Organization profile saved successfully!');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to update organization profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="text-primary h-6 w-6" />
          <h1 className="text-foreground text-2xl font-black tracking-tight">
            Organization Settings
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure your business profile, invoicing details, and GST credentials.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3 rounded-2xl border p-4 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="border-destructive/30 bg-destructive/10 flex items-center gap-3 rounded-2xl border p-4 text-destructive text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="border-border bg-card rounded-3xl border p-6 sm:p-8 shadow-xs space-y-6">
        {/* Tenant identifier read-only badge */}
        <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
                Multi-Tenant Identifier (Fixed)
              </span>
              <span className="text-foreground font-mono font-bold text-sm">{tenantId}</span>
            </div>
          </div>
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
            Isolated Schema
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Store Name */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Store Display Name *</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Contact Email *</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors"
            />
          </div>

          {/* Support Phone */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Support Phone / WhatsApp</span>
            </label>
            <input
              type="tel"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              placeholder="+91 98765 43210"
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors"
            />
          </div>

          {/* GSTIN */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Indian GSTIN (15 Digits)</span>
            </label>
            <input
              type="text"
              maxLength={15}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="e.g. 33AAAAA0000A1Z5"
              className="border-border bg-background text-foreground uppercase focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono transition-colors"
            />
          </div>
        </div>

        {/* Logo URL / Cloudinary Preview */}
        <div className="space-y-2">
          <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
            <CloudUpload className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Store Logo URL (Cloudinary or CDN)</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="border-border bg-muted/40 relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt={formData.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Store className="text-muted-foreground h-6 w-6" />
              )}
            </div>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://res.cloudinary.com/.../image.jpg"
              className="border-border bg-background text-foreground focus:border-primary flex-1 rounded-xl border px-3.5 py-2.5 text-xs transition-colors"
            />
          </div>
        </div>

        {/* Workshop / Warehouse Address */}
        <div className="space-y-1.5">
          <label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Registered Workshop / Billing Address</span>
          </label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Complete address printed on tax invoices and shipping labels"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-3.5 py-2.5 text-xs transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2.5 text-xs font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Settings...' : 'Save Organization Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
