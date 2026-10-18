/**
 * MeasurementsPage.tsx — Tenant Units of Measurement (UOM)
 *
 * Displays standard auto-provisioned units (PCS, Pack, Set, Box, Pair, Kg, Litre)
 * and enables merchants to create custom measurement units.
 */

import { useState, useEffect } from 'react';
import { Ruler, Plus, Search, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface UomItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export function MeasurementsPage(): React.JSX.Element {
  const [uoms, setUoms] = useState<UomItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Add state
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUoms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/uoms');
      if (Array.isArray(response.data)) {
        setUoms(response.data);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load units of measurement.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUoms();
  }, []);

  const handleCreateUom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/uoms', {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        isActive: true,
      });

      if (response.data) {
        setUoms((prev) => [...prev, response.data]);
        setNewCode('');
        setNewName('');
        setNewDescription('');
        setIsAdding(false);
      }
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error creating measurement unit.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUoms = uoms.filter(
    (u) =>
      u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight">Units of Measurement (UOM)</h1>
            <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
              {uoms.length} Units
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Units used for invoicing, pricing, and packaging on product line items and GST invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? 'Close Form' : 'Add Custom UOM'}</span>
        </button>
      </div>

      {/* ── Add UOM Form (Collapsible) ─────────────────────────────── */}
      {isAdding && (
        <form
          onSubmit={handleCreateUom}
          className="border-sky-500/30 bg-card rounded-2xl border p-5 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-sky-500" />
            <h3 className="text-foreground text-sm font-bold">Register Custom Unit of Measurement</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-muted-foreground block text-xs font-medium">UOM Code * (e.g. PCS, ROLL)</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. ROLL, DRUM, TRAY"
                className="border-border bg-background text-foreground uppercase focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-xs font-medium">Display Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Roll, Drum, Tray"
                className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-xs font-medium">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
                className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="border-border bg-background hover:bg-muted text-foreground rounded-lg border px-3 py-1.5 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Unit'}
            </button>
          </div>
        </form>
      )}

      {/* ── Search & Filter ────────────────────────────────────────── */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search measurement codes or names..."
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2 pl-9 pr-4 text-xs transition-colors focus:outline-hidden focus:ring-2"
          />
        </div>
      </div>

      {/* ── UOMs Table ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="border-border bg-card flex h-48 flex-col items-center justify-center rounded-2xl border p-8 text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground mt-3 text-sm">Loading units...</p>
        </div>
      ) : error ? (
        <div className="border-destructive/30 bg-destructive/10 flex items-center justify-between rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchUoms()}
            className="border-destructive/30 bg-background text-foreground hover:bg-destructive/10 rounded-lg border px-3 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-muted/50 text-muted-foreground border-b uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Provisioned</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredUoms.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-md px-2 py-0.5">
                        {u.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{u.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {u.description || 'Standard measurement unit'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Ready</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
