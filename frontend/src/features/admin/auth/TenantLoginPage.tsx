/**
 * TenantLoginPage.tsx — Tenant-based merchant administration login screen
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useTenantAuthStore } from '@/store/tenantAuth.store';
import { ROUTES } from '@/app/router/routes';

export function TenantLoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { loginStore, isLoading, error } = useTenantAuthStore();

  const [tenantId, setTenantId] = useState('faesthatic-corner');
  const [email, setEmail] = useState('admin@faesthaticcorner.com');
  const [password, setPassword] = useState('demoAdmin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    if (!tenantId.trim()) {
      setFormError('Please enter your Tenant ID / Store Code.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your admin email.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    const result = await loginStore({
      tenantId,
      email,
      password,
    });

    if (result.success) {
      navigate(ROUTES.ADMIN.DASHBOARD);
    }
  };

  const handleFillDemo = (): void => {
    setTenantId('faesthatic-corner');
    setEmail('admin@faesthaticcorner.com');
    setPassword('demoAdmin2026');
    setFormError(null);
  };

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="from-primary/15 to-accent/15 absolute -top-40 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr blur-3xl"
      />
      <div
        aria-hidden="true"
        className="from-accent/10 to-primary/5 absolute -bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-gradient-to-bl blur-3xl"
      />

      {/* Top Bar Navigation */}
      <div className="absolute top-6 left-6">
        <Link
          to={ROUTES.ROOT}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center">
          <div className="border-border bg-card/80 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md">
            <Store className="text-primary h-7 w-7" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tenant Administration Portal
          </div>
          <h1 className="text-foreground mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Merchant Sign In
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Sign in with your Store ID and credentials to manage your store catalog and settings.
          </p>
        </div>

        {/* Login Card */}
        <div className="border-border bg-card/90 shadow-card mt-7 rounded-2xl border p-6 sm:p-8 backdrop-blur-xl">
          {(formError || error) && (
            <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant ID Field */}
            <div>
              <label htmlFor="tenant-id" className="text-foreground block text-xs font-semibold uppercase tracking-wider">
                Tenant / Store ID <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <Store className="text-muted-foreground pointer-events-none absolute top-3 left-3.5 h-4 w-4" />
                <input
                  id="tenant-id"
                  type="text"
                  required
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. faesthatic-corner"
                  className="border-input bg-background/50 focus:border-ring focus:ring-ring/20 w-full rounded-xl border py-2.5 pr-4 pl-10 font-mono text-xs transition-all focus:ring-2 focus:outline-hidden"
                />
              </div>
              <p className="text-muted-foreground/80 mt-1 text-[11px]">
                Your unique organization slug assigned during onboarding.
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="text-foreground block text-xs font-semibold uppercase tracking-wider">
                Admin Email <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="text-muted-foreground pointer-events-none absolute top-3 left-3.5 h-4 w-4" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@faesthaticcorner.com"
                  className="border-input bg-background/50 focus:border-ring focus:ring-ring/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-foreground block text-xs font-semibold uppercase tracking-wider">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <Lock className="text-muted-foreground pointer-events-none absolute top-3 left-3.5 h-4 w-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-input bg-background/50 focus:border-ring focus:ring-ring/20 w-full rounded-xl border py-2.5 pr-10 pl-10 text-sm transition-all focus:ring-2 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Store Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill & Signup Link */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={handleFillDemo}
              className="border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Sparkles className="text-primary h-3.5 w-3.5" />
              Demo: Faesthatic Corner
            </button>

            <Link
              to={ROUTES.ADMIN.REGISTER}
              className="text-primary hover:text-primary/80 text-xs font-semibold underline-offset-4 hover:underline"
            >
              New merchant? Register store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
