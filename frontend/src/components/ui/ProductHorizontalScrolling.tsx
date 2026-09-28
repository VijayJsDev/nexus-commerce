import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductItem, ProductItemSkeleton, type Product } from './ProductItem';
import { cn } from '@/lib/utils';

// ─── Default Sample Products ──────────────────────────────────────

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Resin Ocean Tray',
    image: '/product_image_1.jpg',
    amount: 89,
  },
  {
    id: 2,
    name: 'Floral Geode Coaster Set',
    image: '/product_image_2.jpg',
    amount: 55,
  },
  {
    id: 3,
    name: 'Lavender Bouquet Keepsake',
    image: '/product_image_3.jpg',
    amount: 120,
  },
  {
    id: 4,
    name: 'Emerald Wave Clock',
    image: '/product_image_1.jpg',
    amount: 110,
  },
  {
    id: 5,
    name: 'Rose Quartz Trinket Dish',
    image: '/product_image_2.jpg',
    amount: 45,
  },
  {
    id: 6,
    name: 'Midnight Sparkle Canvas',
    image: '/product_image_3.jpg',
    amount: 135,
  },
  {
    id: 7,
    name: 'Amber Horizon Wall Decor',
    image: '/product_image_1.jpg',
    amount: 95,
  },
  {
    id: 8,
    name: 'Amethyst Resin Bookmark',
    image: '/product_image_2.jpg',
    amount: 35,
  },
];

// ─── Props ────────────────────────────────────────────────────────

export interface ProductHorizontalScrollingProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  isLoading?: boolean;
  className?: string;
  onAddToCart?: (product: Product) => void;
}

// ─── Skeleton Component ───────────────────────────────────────────

export function ProductHorizontalScrollingSkeleton({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <section
      aria-label="Loading products"
      className={cn('bg-background w-full py-8 md:py-12', className)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header Skeleton */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
          <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded-md" />
        </div>

        {/* Carousel Skeleton */}
        <div className="flex gap-4 overflow-hidden px-1 py-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function ProductHorizontalScrolling({
  title = 'New Arrivals',
  subtitle = 'Discover our latest handcrafted resin art and bespoke creations',
  products = DEFAULT_PRODUCTS,
  isLoading = false,
  className,
  onAddToCart,
}: ProductHorizontalScrollingProps): React.JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = useCallback((): void => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Tolerance of 2px for fractional scroll positions
    const isAtStart = el.scrollLeft <= 2;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollBounds();
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, products]);

  const handleScroll = (direction: 'left' | 'right'): void => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = Math.max(containerWidth * 0.75, 280);

      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return <ProductHorizontalScrollingSkeleton className={className} />;
  }

  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className={cn('bg-background w-full py-8 md:py-12', className)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* ── Section Header ─────────────────────────────────────── */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-primary mb-1 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Curated Collection</span>
            </div>
            <h2
              id="new-arrivals-heading"
              className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop Arrow Controls in Header */}
          <div className="hidden items-center gap-2 self-end sm:flex">
            <button
              type="button"
              aria-label="Scroll products left"
              disabled={!canScrollLeft}
              onClick={() => handleScroll('left')}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full',
                'border-border bg-card text-foreground border shadow-xs',
                'transition-all duration-200 ease-out',
                'hover:bg-accent hover:text-accent-foreground active:scale-95',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-40'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll products right"
              disabled={!canScrollRight}
              onClick={() => handleScroll('right')}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-full',
                'border-border bg-card text-foreground border shadow-xs',
                'transition-all duration-200 ease-out',
                'hover:bg-accent hover:text-accent-foreground active:scale-95',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-40'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Carousel Container with Floating Edge Chevrons ─────── */}
        {products && products.length > 0 ? (
          <div className="group/carousel relative w-full">
            {/* Floating Left Chevron */}
            <button
              type="button"
              aria-label="Scroll carousel left"
              disabled={!canScrollLeft}
              onClick={() => handleScroll('left')}
              className={cn(
                'absolute top-1/2 -left-3 z-20 -translate-y-1/2 sm:-left-4',
                'h-10 w-10 rounded-full',
                'flex items-center justify-center',
                'bg-card/90 border-border shadow-popover text-foreground border backdrop-blur-md',
                'transition-all duration-200 ease-out',
                'hover:bg-background hover:scale-105 active:scale-95',
                'focus-visible:ring-ring focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                canScrollLeft
                  ? 'opacity-0 group-hover/carousel:opacity-100'
                  : 'pointer-events-none opacity-0'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Scroll Area */}
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              role="region"
              aria-label={`${title} product carousel`}
              className={cn(
                'flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth',
                'gap-4 px-1 py-4 md:gap-6',
                '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                'focus-visible:ring-ring/40 rounded-2xl focus-visible:ring-2 focus-visible:outline-none'
              )}
            >
              {products.map((p) => (
                <ProductItem item={p} key={p.id} onAddToCart={onAddToCart} />
              ))}
            </div>

            {/* Floating Right Chevron */}
            <button
              type="button"
              aria-label="Scroll carousel right"
              disabled={!canScrollRight}
              onClick={() => handleScroll('right')}
              className={cn(
                'absolute top-1/2 -right-3 z-20 -translate-y-1/2 sm:-right-4',
                'h-10 w-10 rounded-full',
                'flex items-center justify-center',
                'bg-card/90 border-border shadow-popover text-foreground border backdrop-blur-md',
                'transition-all duration-200 ease-out',
                'hover:bg-background hover:scale-105 active:scale-95',
                'focus-visible:ring-ring focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                canScrollRight
                  ? 'opacity-0 group-hover/carousel:opacity-100'
                  : 'pointer-events-none opacity-0'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-16 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              No products available
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Check back soon for new arrivals from our handcrafted resin art
              collection.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
