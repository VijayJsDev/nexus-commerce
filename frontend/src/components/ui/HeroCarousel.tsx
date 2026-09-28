import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────

export interface CarouselItem {
  id: number;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface HeroCarouselProps {
  items?: CarouselItem[];
  autoPlayInterval?: number;
  isLoading?: boolean;
  className?: string;
}

// ─── Default Showcase Items ───────────────────────────────────────

const DEFAULT_IMAGES: CarouselItem[] = [
  {
    id: 1,
    src: '/product_image_1.jpg',
    alt: 'Bespoke Resin Art Keepsakes',
    title: 'Bespoke Resin Keepsakes',
    subtitle: 'Handcrafted luxury decor finished with crystal-clear elegance',
  },
  {
    id: 2,
    src: '/product_image_2.jpg',
    alt: 'Artisan Floral Collections',
    title: 'Artisan Floral Keepsakes',
    subtitle: 'Preserving nature in timeless, individually poured resin',
  },
  {
    id: 3,
    src: '/product_image_3.jpg',
    alt: 'Signature Curated Gift Sets',
    title: 'Signature Curated Sets',
    subtitle:
      'Thoughtfully presented with hand-tied satin ribbons for every milestone',
  },
];

// ─── Skeleton Component ───────────────────────────────────────────

export function HeroCarouselSkeleton({
  className,
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <section
      aria-label="Loading carousel"
      className={cn('mx-auto w-full max-w-7xl px-4 py-4 md:px-8', className)}
    >
      <div className="bg-muted border-border shadow-card relative h-64 w-full animate-pulse overflow-hidden rounded-2xl border sm:h-80 md:h-[420px] md:rounded-3xl lg:h-[480px]">
        <div className="absolute bottom-6 left-6 space-y-2 md:left-10">
          <div className="bg-card/60 h-6 w-48 rounded-md sm:h-8 sm:w-72" />
          <div className="bg-card/40 h-4 w-36 rounded-md sm:w-56" />
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function HeroCarousel({
  items = DEFAULT_IMAGES,
  autoPlayInterval = 5000,
  isLoading = false,
  className,
}: HeroCarouselProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const nextSlide = useCallback((): void => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback((): void => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-play timer (pauses on hover, focus, or when paused by user)
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval, items.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  if (isLoading) {
    return <HeroCarouselSkeleton className={className} />;
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Hero product showcases"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={cn(
        'relative mx-auto w-full max-w-7xl px-4 py-4 md:px-8',
        className
      )}
    >
      <div className="group/hero border-border shadow-card bg-muted relative h-64 w-full overflow-hidden rounded-2xl border sm:h-80 md:h-[420px] md:rounded-3xl lg:h-[480px]">
        {/* ── Slides Container ──────────────────────────────────── */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => {
            const isLoaded = imagesLoaded[item.id] ?? false;

            return (
              <div
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${items.length}: ${item.title ?? item.alt}`}
                aria-hidden={currentIndex !== index}
                className="relative h-full w-full flex-shrink-0"
              >
                {/* Shimmer placeholder before load */}
                {!isLoaded && (
                  <div
                    aria-hidden="true"
                    className="bg-muted absolute inset-0 animate-pulse"
                  />
                )}

                <img
                  src={item.src}
                  alt={item.alt}
                  onLoad={() =>
                    setImagesLoaded((prev) => ({ ...prev, [item.id]: true }))
                  }
                  className={cn(
                    'h-full w-full object-cover',
                    'transition-opacity duration-500 ease-out',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                />

                {/* Subtle vignette + gradient overlay for rich contrast */}
                <div
                  aria-hidden="true"
                  className="from-background/95 via-background/25 absolute inset-0 bg-gradient-to-t to-black/20"
                />

                {/* Slide Caption / Text */}
                {(item.title || item.subtitle) && (
                  <div className="absolute right-6 bottom-6 left-6 z-10 max-w-xl sm:right-10 sm:bottom-10 sm:left-10">
                    {item.title && (
                      <h2 className="text-foreground text-xl font-bold tracking-tight drop-shadow-xs sm:text-2xl md:text-3xl lg:text-4xl">
                        {item.title}
                      </h2>
                    )}
                    {item.subtitle && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs drop-shadow-xs sm:mt-2 sm:text-sm md:text-base">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Left / Right Navigation Chevrons ──────────────────── */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prevSlide}
              className={cn(
                'absolute top-1/2 left-3 z-20 -translate-y-1/2 sm:left-5',
                'h-10 w-10 rounded-full',
                'flex items-center justify-center',
                'bg-background/80 hover:bg-background backdrop-blur-md',
                'border-border text-foreground shadow-popover border',
                'opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100',
                'transition-all duration-200 ease-out',
                'hover:scale-105 active:scale-95',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Next slide"
              onClick={nextSlide}
              className={cn(
                'absolute top-1/2 right-3 z-20 -translate-y-1/2 sm:right-5',
                'h-10 w-10 rounded-full',
                'flex items-center justify-center',
                'bg-background/80 hover:bg-background backdrop-blur-md',
                'border-border text-foreground shadow-popover border',
                'opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100',
                'transition-all duration-200 ease-out',
                'hover:scale-105 active:scale-95',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* ── Bottom Controls: Indicator Dots & Play/Pause ──────── */}
        {items.length > 1 && (
          <div className="absolute right-6 bottom-4 z-20 flex items-center gap-2 sm:right-10 sm:bottom-6">
            <div className="bg-background/70 border-border flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 shadow-sm backdrop-blur-md">
              {items.map((_, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 ease-out',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                      isActive
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/40 hover:bg-muted-foreground/70 w-2'
                    )}
                  />
                );
              })}

              {/* Pause/Play Toggle */}
              <button
                type="button"
                aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                onClick={() => setIsPaused((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-1 rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
