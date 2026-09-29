import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { ROUTES } from '@/app/router/routes';
import { cn } from '@/lib/utils';

export function CartDrawer(): React.JSX.Element | null {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalAmount,
    totalCount,
    specialInstructions,
    setSpecialInstructions,
  } = useCartStore();

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = (): void => {
    closeCart();
    navigate(ROUTES.CHECKOUT);
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const subtotal = totalAmount();
  const count = totalCount();

  if (!isMounted) return null;

  return createPortal(
    <>
      {/* ── Backdrop Overlay ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={cn(
          'fixed inset-0 z-[99] bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />

      {/* ── Side Sheet Panel ─────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[100] h-full w-full sm:max-w-md md:max-w-lg',
          'bg-card text-card-foreground border-border shadow-modal border-l',
          'flex flex-col justify-between overflow-hidden',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ── Top Header ─────────────────────────────────────────── */}
        <div className="border-border bg-card flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <h2
              id="cart-drawer-title"
              className="text-foreground text-xl font-bold tracking-tight sm:text-2xl"
            >
              Your cart
            </h2>
            {count > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className={cn(
              'text-muted-foreground rounded-full p-2',
              'hover:text-foreground hover:bg-accent',
              'transition-all duration-200 active:scale-95',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Column Headers (Product / Total) ────────────────────── */}
        {items.length > 0 && (
          <div className="text-muted-foreground border-border/60 bg-muted/30 flex items-center justify-between border-b px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase sm:px-6">
            <span>Product</span>
            <span>Total</span>
          </div>
        )}

        {/* ── Scrollable Body ─────────────────────────────────────── */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4 sm:px-6">
          {items.length > 0 ? (
            <ul className="divide-border space-y-4 divide-y">
              {items.map((item) => {
                const itemTotal = item.amount * item.quantity;
                return (
                  <li key={item.id} className="flex gap-4 pt-4 first:pt-0">
                    {/* Item Thumbnail */}
                    <div className="border-border bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-xl border sm:h-24 sm:w-24">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>

                        {/* Item Line Total */}
                        <span className="text-foreground shrink-0 text-sm font-bold sm:text-base">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="border-border bg-background inline-flex items-center rounded-lg border shadow-xs">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-l-lg p-1.5 transition-colors active:scale-95 sm:p-2"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-foreground w-8 text-center text-xs font-semibold select-none sm:w-10 sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-r-lg p-1.5 transition-colors active:scale-95 sm:p-2"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Empty Cart Placeholder */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted text-muted-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <ShoppingBag className="h-8 w-8 stroke-1" />
              </div>
              <h3 className="text-foreground text-lg font-semibold">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                Looks like you haven&apos;t added any handcrafted items to your
                cart yet.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* ── Customer Reviews Widget ───────────────────────── */}
              <div className="border-border bg-card rounded-xl border p-4 shadow-xs">
                <h4 className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                  Customer Reviews
                </h4>
                <div className="text-primary mb-1.5 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-primary text-primary h-4 w-4"
                    />
                  ))}
                  <span className="text-foreground ml-1.5 text-xs font-bold">
                    5.0
                  </span>
                </div>
                <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <span>Kavipriya</span>
                  <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    07/17/2026
                  </span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs italic">
                  &ldquo;Remarkable crystal-clear resin craft and beautifully
                  packaged with ribbons. Arrived quickly and exceeded my
                  expectations!&rdquo;
                </p>
              </div>

              {/* ── Order Special Instructions Accordion ──────────── */}
              <div className="border-border bg-card overflow-hidden rounded-xl border">
                <button
                  type="button"
                  onClick={() => setShowInstructions((prev) => !prev)}
                  className="text-foreground hover:bg-accent/50 flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold transition-colors"
                >
                  <span>Order special instructions</span>
                  <ChevronDown
                    className={cn(
                      'text-muted-foreground h-4 w-4 transition-transform duration-200',
                      showInstructions ? 'rotate-180' : ''
                    )}
                  />
                </button>
                {showInstructions && (
                  <div className="p-3.5 pt-0">
                    <textarea
                      rows={3}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Add personalized gift message or packaging instructions..."
                      className={cn(
                        'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border p-2.5 text-xs',
                        'focus-visible:ring-ring resize-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none'
                      )}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Drawer Footer ───────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="border-border bg-card/95 space-y-4 border-t p-5 backdrop-blur-md sm:p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-foreground text-base font-semibold">
                Estimated total
              </span>
              <span className="text-foreground text-xl font-bold sm:text-2xl">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Tax included.{' '}
              <span className="underline underline-offset-2">Shipping</span> and
              discounts calculated at checkout.
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className={cn(
                'w-full rounded-xl px-4 py-3.5',
                'bg-foreground text-background text-sm font-semibold sm:text-base',
                'shadow-sm hover:opacity-90 active:scale-[0.99]',
                'transition-all duration-200 ease-out',
                'flex items-center justify-center gap-2',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              )}
            >
              <span>Check out</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
