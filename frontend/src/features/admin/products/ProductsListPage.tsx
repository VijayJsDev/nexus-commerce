/**
 * ProductsListPage.tsx — Product Master Management
 *
 * Displays the tenant's product catalog with 11-field support, image preview,
 * GST rates, and quick actions. Full modal/CRUD will be expanded in Step 5.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  FolderTree,
  Ruler,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { ROUTES } from '@/app/router/routes';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  categoryName?: string;
  unitRate: number;
  effectiveDate: string;
  maxDiscount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  uomName?: string;
  hsnCode?: string;
  description?: string;
  primaryImageUrl?: string;
  isActive: boolean;
}

export function ProductsListPage(): React.JSX.Element {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to load products. Ensure the backend API is active.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight">All Products</h1>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
              {products.length} Items
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your master inventory with Indian GST rates, SKU tracking, and Cloudinary media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN.CATEGORIES}
            className="border-border bg-card hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors"
          >
            <FolderTree className="h-4 w-4 text-amber-500" />
            <span>Categories</span>
          </Link>
          <Link
            to={ROUTES.ADMIN.MEASUREMENTS}
            className="border-border bg-card hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors"
          >
            <Ruler className="h-4 w-4 text-sky-500" />
            <span>UOMs</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              // Will open Step 5 modal
              alert('Step 5 will unlock the 11-Field Product Creation & Cloudinary Dropzone modal!');
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2 pl-9 pr-4 text-xs transition-colors focus:outline-hidden focus:ring-2"
          />
        </div>
      </div>

      {/* ── Products Table / Content ───────────────────────────────── */}
      {isLoading ? (
        <div className="border-border bg-card flex h-64 flex-col items-center justify-center rounded-2xl border p-8 text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground mt-3 text-sm">Loading product catalog...</p>
        </div>
      ) : error ? (
        <div className="border-destructive/30 bg-destructive/10 flex items-center justify-between rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchProducts()}
            className="border-destructive/30 bg-background text-foreground hover:bg-destructive/10 rounded-lg border px-3 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-foreground mt-4 text-lg font-bold">No products in catalog yet</h3>
          <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed">
            Your catalog starts fresh and clean. Ready for Step 5 to create your first product with all 11 fields and Cloudinary image upload.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                alert('Product Creation modal will be fully activated in Step 5!');
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create First Product</span>
            </button>
            <Link
              to={ROUTES.ROOT}
              target="_blank"
              className="border-border bg-background hover:bg-muted text-foreground inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium"
            >
              <span>View Storefront</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-muted/50 text-muted-foreground border-b uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Unit Rate</th>
                  <th className="px-4 py-3">GST (CGST/SGST/IGST)</th>
                  <th className="px-4 py-3">UOM</th>
                  <th className="px-4 py-3">Effective Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="border-border bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                          {p.primaryImageUrl ? (
                            <img
                              src={p.primaryImageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-foreground font-semibold">{p.name}</span>
                          {p.hsnCode && (
                            <span className="text-muted-foreground block text-[10px] font-mono">
                              HSN: {p.hsnCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md px-2 py-0.5 text-[11px] font-medium">
                        {p.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      ₹{p.unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.cgstRate}% + {p.sgstRate}% ({p.igstRate}%)
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.uomName || 'PCS'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.effectiveDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium"
                        onClick={() => alert(`Edit Product ${p.name} (Step 5)`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info notice */}
      <div className="border-border/60 bg-muted/20 flex items-center gap-2.5 rounded-xl border p-3 text-xs text-muted-foreground">
        <Layers className="h-4 w-4 text-primary shrink-0" />
        <span>
          Products are filtered in real-time by your store tenant ID. Public storefront reflects newly added items immediately.
        </span>
      </div>
    </div>
  );
}
