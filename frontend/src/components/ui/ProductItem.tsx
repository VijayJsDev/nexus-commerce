import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  image: string;
  amount: number;
}

export interface ProductItemProps {
  item: Product;
  onAddToCart?: (item: Product) => void;
  className?: string;
  isLoading?: boolean;
}

// ─── Skeleton Component ───────────────────────────────────────────

export function ProductItemSkeleton({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex w-[200px] shrink-0 flex-col sm:w-[240px] md:w-[280px]',
        'border-border bg-card shadow-card rounded-2xl border p-3',
        'animate-pulse select-none',
        className
      )}
    >
      {/* Image placeholder */}
      <div className="bg-muted aspect-square w-full rounded-xl" />

      {/* Details placeholder */}
      <div className="mt-3 space-y-2">
        <div className="bg-muted h-4 w-3/4 rounded-md" />
        <div className="bg-muted h-5 w-1/3 rounded-md" />
      </div>

      {/* Button placeholder */}
      <div className="bg-muted mt-3 h-10 w-full rounded-xl" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function ProductItem({
  item,
  onAddToCart,
  className,
  isLoading = false,
}: ProductItemProps): React.JSX.Element {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (isLoading) {
    return <ProductItemSkeleton className={className} />;
  }

  const handleAddToCart = (): void => {
    setIsAdded(true);
    onAddToCart?.(item);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.amount);

  return (
    <article
      className={cn(
        'group relative flex shrink-0 snap-start flex-col',
        'w-[200px] sm:w-[240px] md:w-[280px]',
        'border-border bg-card shadow-card rounded-2xl border p-3',
        'ease-out motion-safe:transition-all motion-safe:duration-200',
        'hover:shadow-popover hover:border-primary/40 motion-safe:hover:-translate-y-1',
        'focus-within:border-ring focus-within:ring-ring/20 focus-within:ring-2',
        className
      )}
    >
      {/* ── Image with Shimmer Loader ─────────────────────────────── */}
      <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-xl">
        {/* Shimmer skeleton while image loads */}
        <div
          aria-hidden="true"
          className={cn(
            'bg-muted absolute inset-0 motion-safe:animate-pulse',
            'transition-opacity duration-300',
            isImageLoaded ? 'pointer-events-none opacity-0' : 'opacity-100'
          )}
        />

        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={cn(
            'h-full w-full object-cover',
            'ease-out motion-safe:transition-transform motion-safe:duration-300',
            'group-hover:scale-105 motion-reduce:transform-none',
            isImageLoaded ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-300'
          )}
        />
      </div>

      {/* ── Product Info ─────────────────────────────────────────── */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3
            title={item.name}
            className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-semibold tracking-tight transition-colors duration-200 sm:text-base"
          >
            {item.name}
          </h3>
          <p className="text-foreground mt-1 text-base font-bold tracking-tight sm:text-lg">
            {formattedPrice}
          </p>
        </div>

        {/* ── Add to Cart Button ─────────────────────────────────── */}
        <button
          type="button"
          aria-label={`Add ${item.name} to cart`}
          onClick={handleAddToCart}
          className={cn(
            'mt-3 inline-flex w-full items-center justify-center gap-2',
            'rounded-xl px-4 py-2.5 text-xs font-semibold sm:text-sm',
            'transition-all duration-200 ease-out',
            'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'active:scale-[0.98] motion-reduce:active:scale-100',
            isAdded
              ? 'bg-success text-success-foreground shadow-sm'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
          )}
        >
          {isAdded ? (
            <>
              <Check
                className="motion-safe:animate-in motion-safe:zoom-in-50 h-4 w-4 shrink-0 duration-150"
                aria-hidden="true"
              />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
                aria-hidden="true"
              />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
