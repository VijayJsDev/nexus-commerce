import { SearchIcon, ShoppingBag, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────

export interface HeaderProps {
  cartCount?: number;
  isLoading?: boolean;
  className?: string;
  onSearchClick?: () => void;
  onAccountClick?: () => void;
  onCartClick?: () => void;
}

// ─── Skeleton Component ───────────────────────────────────────────

export function HeaderSkeleton({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <header
      aria-label="Loading header"
      className={cn(
        'bg-background/80 border-border sticky top-0 z-50 w-full border-b shadow-xs backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand placeholder */}
        <div className="flex items-center gap-3">
          <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
          <div className="bg-muted hidden h-5 w-32 animate-pulse rounded-md sm:block" />
        </div>

        {/* Actions placeholder */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-muted h-9 w-9 animate-pulse rounded-full" />
          <div className="bg-muted hidden h-9 w-24 animate-pulse rounded-full md:block" />
          <div className="bg-muted h-9 w-9 animate-pulse rounded-full" />
          <div className="bg-muted h-9 w-9 animate-pulse rounded-full" />
        </div>
      </div>
    </header>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function Header({
  cartCount,
  isLoading = false,
  className,
  onSearchClick,
  onAccountClick,
  onCartClick,
}: HeaderProps): React.JSX.Element {
  const { totalCount, openCart } = useCartStore();
  const effectiveCartCount = cartCount ?? totalCount();

  const handleCartClick = (): void => {
    onCartClick?.();
    openCart();
  };

  if (isLoading) {
    return <HeaderSkeleton className={className} />;
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-background/85 backdrop-blur-md',
        'border-border border-b shadow-xs',
        'transition-colors duration-200',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* ── Brand Logo & Title ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="border-border bg-card relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border shadow-xs">
            <img
              src="/faesthatic_corner_logo.jpg"
              alt="Faesthatic Corner Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
          <span className="text-foreground text-base font-bold tracking-tight select-none sm:text-lg">
            Faesthatic Corner
          </span>
        </div>

        {/* ── Navigation Actions ─────────────────────────────────── */}
        <nav aria-label="Quick actions">
          <ul className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Button */}
            <li>
              <button
                type="button"
                aria-label="Search products"
                onClick={onSearchClick}
                className={cn(
                  'text-muted-foreground rounded-full p-2 sm:p-2.5',
                  'hover:text-foreground hover:bg-accent',
                  'transition-all duration-200 ease-out active:scale-95',
                  'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                )}
              >
                <SearchIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </li>

            {/* Theme Toggle Pill */}
            <li className="hidden items-center sm:flex">
              <ThemeToggle className="origin-right scale-85 [&>span]:hidden" />
            </li>

            {/* User Account Button */}
            <li>
              <button
                type="button"
                aria-label="User Account"
                onClick={onAccountClick}
                className={cn(
                  'text-muted-foreground rounded-full p-2 sm:p-2.5',
                  'hover:text-foreground hover:bg-accent',
                  'transition-all duration-200 ease-out active:scale-95',
                  'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                )}
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
            </li>

            {/* Shopping Cart Button with Badge */}
            <li className="relative">
              <button
                type="button"
                aria-label={`Shopping Cart with ${effectiveCartCount} items`}
                onClick={handleCartClick}
                className={cn(
                  'text-muted-foreground rounded-full p-2 sm:p-2.5',
                  'hover:text-foreground hover:bg-accent',
                  'transition-all duration-200 ease-out active:scale-95',
                  'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                )}
              >
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                {effectiveCartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -top-0.5 -right-0.5',
                      'flex items-center justify-center',
                      'h-[1.125rem] min-w-[1.125rem] px-1',
                      'bg-primary text-primary-foreground rounded-full text-[10px] font-bold',
                      'ring-background shadow-xs ring-2',
                      'motion-safe:animate-in motion-safe:zoom-in-75 duration-200'
                    )}
                  >
                    {effectiveCartCount > 99 ? '99+' : effectiveCartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* ── Slide-over Cart Drawer ───────────────────────────────── */}
      <CartDrawer />
    </header>
  );
}
