/**
 * CategoriesPage.tsx — Tenant Product Category Master
 *
 * Allows merchants to manage product taxonomies.
 * Connects directly to GET /api/categories and POST /api/categories.
 */

import { useState, useEffect } from 'react';
import { FolderTree, Plus, Search, Tag, AlertCircle, Layers } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export function CategoriesPage(): React.JSX.Element {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Add state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/categories');
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load categories.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const slug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const response = await apiClient.post('/api/categories', {
        name: newName.trim(),
        slug,
        description: newDescription.trim() || undefined,
        isActive: true,
      });

      if (response.data) {
        setCategories((prev) => [...prev, response.data]);
        setNewName('');
        setNewDescription('');
        setIsAdding(false);
      }
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error creating category'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight">Product Categories</h1>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize products into hierarchical taxonomies to simplify discovery for your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? 'Close Form' : 'Add Category'}</span>
        </button>
      </div>

      {/* ── Add Category Card (Collapsible) ────────────────────────── */}
      {isAdding && (
        <form
          onSubmit={handleCreateCategory}
          className="border-primary/30 bg-card rounded-2xl border p-5 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h3 className="text-foreground text-sm font-bold">Create New Category</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground block text-xs font-medium">Category Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Resin Decor, Scented Candles, Hampers"
                className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-xs font-medium">Description (Optional)</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief category summary"
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
              {isSubmitting ? 'Saving...' : 'Save Category'}
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
            placeholder="Search categories..."
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2 pl-9 pr-4 text-xs transition-colors focus:outline-hidden focus:ring-2"
          />
        </div>
      </div>

      {/* ── Categories List / Table ─────────────────────────────────── */}
      {isLoading ? (
        <div className="border-border bg-card flex h-48 flex-col items-center justify-center rounded-2xl border p-8 text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground mt-3 text-sm">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="border-destructive/30 bg-destructive/10 flex items-center justify-between rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchCategories()}
            className="border-destructive/30 bg-background text-foreground hover:bg-destructive/10 rounded-lg border px-3 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex h-16 w-16 items-center justify-center rounded-2xl">
            <FolderTree className="h-8 w-8" />
          </div>
          <h3 className="text-foreground mt-4 text-lg font-bold">No categories defined yet</h3>
          <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed">
            Create categories like Resin Clocks, Candle Sets, or Home Decor to group your items.
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className="border-border bg-card hover:border-amber-500/40 relative flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex h-10 w-10 items-center justify-center rounded-xl">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    Active
                  </span>
                </div>
                <h3 className="text-foreground mt-3 text-base font-bold">{c.name}</h3>
                <span className="text-muted-foreground block font-mono text-xs">slug: {c.slug}</span>
                {c.description && (
                  <p className="text-muted-foreground mt-2 text-xs line-clamp-2">{c.description}</p>
                )}
              </div>
              <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Auto-synced to Storefront
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
