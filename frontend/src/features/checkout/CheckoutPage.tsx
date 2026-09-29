import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { ROUTES } from '@/app/router/routes';
import { cn } from '@/lib/utils';

export function CheckoutPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart, specialInstructions } = useCartStore();

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>(
    'standard'
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>(
    'card'
  );
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = totalAmount();
  const shippingCost = shippingMethod === 'standard' ? 0 : 15;
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const estimatedTax = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(
    0,
    subtotal - discountAmount + shippingCost + estimatedTax
  );

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const handleApplyDiscount = (e: React.FormEvent): void => {
    e.preventDefault();
    if (
      discountCode.trim().toLowerCase() === 'welcome10' ||
      discountCode.trim().toLowerCase() === 'artisan'
    ) {
      setDiscountApplied(true);
    } else {
      alert('Try promo code: WELCOME10 for 10% off!');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
    }, 1200);
  };

  // If order complete, display celebration confirmation
  if (orderComplete) {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="border-border bg-card shadow-card w-full max-w-md space-y-5 rounded-2xl border p-8 text-center">
          <div className="bg-success/10 text-success mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="text-primary text-xs font-bold tracking-wider uppercase">
              Order Confirmed
            </span>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-muted-foreground text-sm">
              Order{' '}
              <span className="text-foreground font-mono font-semibold">
                #FC-{Math.floor(100000 + Math.random() * 900000)}
              </span>{' '}
              has been placed successfully. A confirmation email has been
              dispatched.
            </p>
          </div>

          <div className="bg-muted/50 border-border/60 space-y-2 rounded-xl border p-4 text-left text-xs">
            <div className="text-muted-foreground flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="text-foreground font-semibold">
                {shippingMethod === 'standard'
                  ? '3–5 Business Days'
                  : '1–2 Business Days'}
              </span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Payment Status:</span>
              <span className="text-success font-semibold">
                Paid via {paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ROOT)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-3 text-sm font-semibold shadow-sm transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // If cart is completely empty, offer redirect
  if (items.length === 0) {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="border-border bg-card shadow-card w-full max-w-md space-y-4 rounded-2xl border p-8 text-center">
          <div className="bg-muted text-muted-foreground mx-auto flex h-14 w-14 items-center justify-center rounded-full">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="text-foreground text-xl font-bold">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground text-sm">
            Please add items from the storefront collection before proceeding to
            checkout.
          </p>
          <Link
            to={ROUTES.ROOT}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="border-border bg-card/60 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.ROOT}
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="border-border bg-card flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border shadow-xs">
              <img
                src="/faesthatic_corner_logo.jpg"
                alt="Faesthatic Corner"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
              Faesthatic Corner
            </span>
          </Link>

          <div className="text-muted-foreground bg-muted/50 border-border/50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
            <Lock className="text-success h-3.5 w-3.5" />
            <span className="hidden sm:inline">256-bit SSL</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* ── Checkout Container ───────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ── Left Column: Checkout Forms ───────────────────────── */}
          <div className="space-y-8 lg:col-span-7">
            {/* Breadcrumb Navigation */}
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Link
                to={ROUTES.ROOT}
                className="hover:text-foreground transition-colors"
              >
                Store
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Checkout</span>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Contact Information */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Contact Information
                  </h2>
                  <span className="text-muted-foreground text-xs">
                    Guest checkout
                  </span>
                </div>
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="text-muted-foreground mb-1.5 block text-xs font-medium"
                  >
                    Email address
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                  />
                </div>
              </section>

              {/* Shipping Address */}
              <section className="space-y-4">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="checkout-first-name"
                      className="text-muted-foreground mb-1.5 block text-xs font-medium"
                    >
                      First name
                    </label>
                    <input
                      id="checkout-first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-last-name"
                      className="text-muted-foreground mb-1.5 block text-xs font-medium"
                    >
                      Last name
                    </label>
                    <input
                      id="checkout-last-name"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="checkout-address"
                    className="text-muted-foreground mb-1.5 block text-xs font-medium"
                  >
                    Street Address
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Artisan Lane, Suite 4B"
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="text-muted-foreground mb-1.5 block text-xs font-medium"
                    >
                      City
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-state"
                      className="text-muted-foreground mb-1.5 block text-xs font-medium"
                    >
                      State / Province
                    </label>
                    <input
                      id="checkout-state"
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Karnataka"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-zip"
                      className="text-muted-foreground mb-1.5 block text-xs font-medium"
                    >
                      Postal Code
                    </label>
                    <input
                      id="checkout-zip"
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="560001"
                      className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Method */}
              <section className="space-y-4">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Shipping Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      shippingMethod === 'standard'
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-accent/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                          <Truck className="text-primary h-4 w-4" />
                          <span>Standard Delivery</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          3–5 business days
                        </p>
                      </div>
                    </div>
                    <span className="text-success text-sm font-bold">FREE</span>
                  </label>

                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      shippingMethod === 'express'
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-accent/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                          <Package className="text-primary h-4 w-4" />
                          <span>Express Priority Delivery</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          1–2 business days
                        </p>
                      </div>
                    </div>
                    <span className="text-foreground text-sm font-bold">
                      $15.00
                    </span>
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="space-y-4">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-accent/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-primary h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">
                          Credit / Debit Card
                        </span>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Visa, MC, Amex
                    </span>
                  </label>

                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-accent/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-primary h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">
                          UPI / Instant QR
                        </span>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      GPay, PhonePe, Paytm
                    </span>
                  </label>

                  <label
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-accent/40'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-foreground text-sm font-semibold">
                        Cash on Delivery
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Pay upon arrival
                    </span>
                  </label>
                </div>
              </section>

              {/* Special Instructions Preview if any */}
              {specialInstructions && (
                <div className="border-border bg-muted/40 rounded-xl border p-4 text-xs">
                  <span className="text-foreground mb-1 block font-semibold">
                    Your Special Instructions:
                  </span>
                  <p className="text-muted-foreground italic">
                    &ldquo;{specialInstructions}&rdquo;
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-xl px-6 py-4 text-base font-semibold',
                  'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-[0.99]',
                  'flex items-center justify-center gap-2 transition-all duration-200',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  isSubmitting && 'cursor-wait opacity-70'
                )}
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? 'Processing Payment...'
                    : `Pay ${formatCurrency(grandTotal)}`}
                </span>
              </button>
            </form>
          </div>

          {/* ── Right Column: Order Summary ───────────────────────── */}
          <div className="lg:col-span-5">
            <div className="border-border bg-card shadow-card sticky top-24 space-y-6 rounded-2xl border p-6">
              <h2 className="text-foreground flex items-center justify-between text-lg font-semibold tracking-tight">
                <span>Order Summary</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </h2>

              {/* Items List */}
              <ul className="divide-border max-h-72 space-y-3 divide-y overflow-y-auto pr-1">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 pt-3 first:pt-0"
                  >
                    <div className="border-border bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="bg-primary text-primary-foreground ring-card absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-2">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground line-clamp-1 text-xs font-semibold sm:text-sm">
                        {item.name}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(item.amount)} each
                      </p>
                    </div>
                    <span className="text-foreground text-xs font-bold sm:text-sm">
                      {formatCurrency(item.amount * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Promo code (WELCOME10)"
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-xl border py-2 pr-3 pl-9 text-xs focus-visible:ring-2 focus-visible:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="border-border bg-muted text-foreground hover:bg-accent rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Totals */}
              <div className="border-border space-y-2 border-t pt-4 text-xs sm:text-sm">
                <div className="text-muted-foreground flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {discountApplied && (
                  <div className="text-success flex justify-between">
                    <span>Discount (10%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="text-muted-foreground flex justify-between">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div className="text-muted-foreground flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(estimatedTax)}
                  </span>
                </div>

                <div className="text-foreground border-border flex justify-between border-t pt-3 text-base font-bold sm:text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="border-border space-y-2 border-t pt-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <ShieldCheck className="text-success h-4 w-4" />
                  <span>100% Handcrafted Artisan Guarantee</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Lock className="text-primary h-4 w-4" />
                  <span>Encrypted Bank-Grade Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
